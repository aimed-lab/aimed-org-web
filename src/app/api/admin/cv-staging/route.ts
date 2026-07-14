/**
 * CV staging workflow API.
 *
 * Instead of writing parsed CV items straight into the (ephemeral, rebuilt-on-
 * deploy) production database, this route commits the updated `data/*.tsv`
 * source-of-truth files to a `cv-staging` git branch. Vercel builds that branch
 * into a live preview deployment, so the PI can SEE the effect before it goes
 * live, then Accept (merge to production), Revise (re-stage with a comment), or
 * Reject (discard the branch).
 *
 *   POST  – stage the selected parsed items onto the cv-staging branch.
 *   GET   – current staging status: what's staged + the live preview URL/state.
 *   PUT   – { action: "accept" | "revise" | "reject", comment?, ... }.
 *
 * Parsing itself is unchanged — the admin page still calls /api/cv-parse to
 * extract all sections; this route only handles the durable staging half.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import {
  SECTIONS,
  SECTION_KEYS,
  type SectionKey,
} from "@/lib/cv-sections";
import { parseTsv, serializeTsv, maxId, type TsvRow } from "@/lib/tsv";
import {
  isConfigured,
  baseBranch,
  getFileContent,
  stageFiles,
  compareStaging,
  getPreview,
  acceptStaging,
  deleteBranch,
  STAGING_BRANCH,
  type FileChange,
} from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MANIFEST_PATH = "data/_cv-staging.json";

type Selections = Partial<Record<SectionKey, Record<string, unknown>[]>>;

interface StageManifest {
  sourceCV: string;
  stagedAt: string;
  comment: string;
  revisions: { at: string; comment: string }[];
  counts: Record<string, number>;
  sections: Partial<Record<SectionKey, TsvRow[]>>;
}

function unconfiguredResponse() {
  return NextResponse.json(
    {
      configured: false,
      error:
        "GitHub staging is not configured yet. Set GITHUB_TOKEN (and optionally GITHUB_REPO / GITHUB_BASE_BRANCH) in the Vercel project environment variables.",
    },
    { status: 501 }
  );
}

/** Build updated TSV files from the selected items and commit them to cv-staging. */
async function buildAndStage(
  selections: Selections,
  sourceCV: string,
  comment: string,
  priorRevisions: { at: string; comment: string }[] = []
): Promise<{ files: FileChange[]; manifest: StageManifest }> {
  const now = new Date().toISOString();
  const files: FileChange[] = [];
  const counts: Record<string, number> = {};
  const manifestSections: Partial<Record<SectionKey, TsvRow[]>> = {};

  for (const key of SECTION_KEYS) {
    const items = selections[key];
    if (!items || items.length === 0) continue;

    const def = SECTIONS[key];
    const existingText = await getFileContent(`data/${def.tsvFile}`, baseBranch());
    const { rows: existingRows } = existingText
      ? parseTsv(existingText)
      : { rows: [] as TsvRow[] };

    const seen = new Set(existingRows.map((r) => def.dedupKey(r)));
    let nextId = maxId(existingRows) + 1;
    const added: TsvRow[] = [];

    for (const item of items) {
      const row = def.toRow(item, sourceCV);
      const dk = def.dedupKey(row);
      if (seen.has(dk)) continue; // already on the site or duplicate within batch
      seen.add(dk);
      row.id = String(nextId++);
      row.createdAt = now;
      row.updatedAt = now;
      added.push(row);
    }

    if (added.length === 0) continue;

    counts[key] = added.length;
    manifestSections[key] = added;
    files.push({
      path: `data/${def.tsvFile}`,
      content: serializeTsv(def.columns, [...existingRows, ...added]),
    });
  }

  const manifest: StageManifest = {
    sourceCV,
    stagedAt: now,
    comment,
    revisions: priorRevisions,
    counts,
    sections: manifestSections,
  };

  files.push({
    path: MANIFEST_PATH,
    content: JSON.stringify(manifest, null, 2) + "\n",
  });

  return { files, manifest };
}

function stageMessage(sourceCV: string, comment: string, revision: boolean): string {
  const verb = revision ? "Revise" : "Stage";
  const base = `${verb} CV import from ${sourceCV}`;
  return comment ? `${base} — ${comment}` : base;
}

async function currentManifest(): Promise<StageManifest | null> {
  const text = await getFileContent(MANIFEST_PATH, STAGING_BRANCH);
  if (!text) return null;
  try {
    return JSON.parse(text) as StageManifest;
  } catch {
    return null;
  }
}

function handleError(error: unknown) {
  const status =
    typeof error === "object" && error && "status" in error
      ? (error as { status: number }).status
      : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  console.error("[cv-staging]", message);
  return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
}

/* ── POST: stage selected items ── */

export async function POST(request: NextRequest) {
  if (!(await verifyAdminToken(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isConfigured()) return unconfiguredResponse();

  try {
    const body = await request.json();
    const selections: Selections = body.selections || {};
    const sourceCV: string = body.sourceFilename || "CV";
    const comment: string = (body.comment || "").toString().slice(0, 500);

    const totalSelected = SECTION_KEYS.reduce(
      (n, k) => n + (selections[k]?.length || 0),
      0
    );
    if (totalSelected === 0) {
      return NextResponse.json({ error: "No items selected to stage" }, { status: 400 });
    }

    const { files, manifest } = await buildAndStage(selections, sourceCV, comment);

    const addedTotal = Object.values(manifest.counts).reduce((a, b) => a + b, 0);
    if (addedTotal === 0) {
      return NextResponse.json(
        { error: "All selected items already exist on the site — nothing new to stage." },
        { status: 409 }
      );
    }

    const commit = await stageFiles(files, stageMessage(sourceCV, comment, false));

    return NextResponse.json({
      ok: true,
      staged: manifest.counts,
      commit,
      preview: await getPreview(),
    });
  } catch (error) {
    return handleError(error);
  }
}

/* ── GET: staging status ── */

export async function GET(request: NextRequest) {
  if (!(await verifyAdminToken(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isConfigured()) return unconfiguredResponse();

  try {
    const comparison = await compareStaging();
    if (!comparison) {
      return NextResponse.json({ configured: true, staged: false });
    }
    const [manifest, preview] = await Promise.all([currentManifest(), getPreview()]);
    return NextResponse.json({
      configured: true,
      staged: true,
      aheadBy: comparison.aheadBy,
      changedFiles: comparison.changedFiles,
      manifest,
      preview,
    });
  } catch (error) {
    return handleError(error);
  }
}

/* ── PUT: accept / revise / reject ── */

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isConfigured()) return unconfiguredResponse();

  try {
    const body = await request.json();
    const action: string = body.action;
    const comment: string = (body.comment || "").toString().slice(0, 500);

    if (action === "accept") {
      const existing = await compareStaging();
      if (!existing) {
        return NextResponse.json({ error: "Nothing is staged to accept." }, { status: 409 });
      }
      const msg = comment
        ? `Accept CV import: ${comment} (by ${admin})`
        : `Accept CV import (by ${admin})`;
      const commit = await acceptStaging(msg);
      return NextResponse.json({ ok: true, action: "accepted", commit });
    }

    if (action === "reject") {
      await deleteBranch(STAGING_BRANCH);
      return NextResponse.json({ ok: true, action: "rejected" });
    }

    if (action === "revise") {
      const selections: Selections = body.selections || {};
      const sourceCV: string = body.sourceFilename || "CV";
      if (!comment) {
        return NextResponse.json(
          { error: "A change comment is required when revising." },
          { status: 400 }
        );
      }
      const totalSelected = SECTION_KEYS.reduce(
        (n, k) => n + (selections[k]?.length || 0),
        0
      );
      if (totalSelected === 0) {
        return NextResponse.json({ error: "No items to stage in the revision" }, { status: 400 });
      }

      const prior = (await currentManifest())?.revisions || [];
      const { files, manifest } = await buildAndStage(selections, sourceCV, comment, [
        ...prior,
        { at: new Date().toISOString(), comment },
      ]);
      const commit = await stageFiles(files, stageMessage(sourceCV, comment, true));
      return NextResponse.json({
        ok: true,
        action: "revised",
        staged: manifest.counts,
        commit,
        preview: await getPreview(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
