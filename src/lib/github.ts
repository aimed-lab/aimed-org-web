/**
 * Minimal GitHub REST client for the CV staging workflow — no external SDK, so
 * there is nothing to keep upgraded. It commits the updated `data/*.tsv` files
 * to a dedicated `cv-staging` branch, which Vercel auto-builds into a live
 * preview deployment. Accepting merges that branch into the production branch;
 * rejecting deletes it.
 *
 * Configuration (set once as environment variables in Vercel):
 *   GITHUB_TOKEN        (required) fine-grained or classic PAT with
 *                       Contents: read & write on the repo below.
 *   GITHUB_REPO         "owner/repo"  (default: aimed-lab/aimed-org-web)
 *   GITHUB_BASE_BRANCH  production branch (default: main)
 *   CV_PREVIEW_URL      optional explicit preview URL for the staging branch,
 *                       used as a fallback if the live URL can't be read.
 */

const API = "https://api.github.com";

export const STAGING_BRANCH = "cv-staging";

function repo(): string {
  return process.env.GITHUB_REPO || "aimed-lab/aimed-org-web";
}

export function baseBranch(): string {
  return process.env.GITHUB_BASE_BRANCH || "main";
}

export function isConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function gh<T = unknown>(
  path: string,
  init: RequestInit = {},
  allow404 = false
): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GitHubError(500, "GITHUB_TOKEN is not configured");

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "aimed-lab-cv-staging",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (res.status === 404 && allow404) return null;
  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = (data && (data.message as string)) || res.statusText;
    throw new GitHubError(res.status, `GitHub ${res.status}: ${msg}`);
  }
  return data as T;
}

/* ── Low-level git data operations ── */

async function getRefSha(branch: string): Promise<string | null> {
  const data = await gh<{ object: { sha: string } }>(
    `/repos/${repo()}/git/ref/heads/${encodeURIComponent(branch)}`,
    {},
    true
  );
  return data?.object.sha ?? null;
}

async function getCommitTreeSha(commitSha: string): Promise<string> {
  const data = await gh<{ tree: { sha: string } }>(
    `/repos/${repo()}/git/commits/${commitSha}`
  );
  return data!.tree.sha;
}

/** Read a text file at a ref. Returns null if the file does not exist. */
export async function getFileContent(path: string, ref: string): Promise<string | null> {
  const data = await gh<{ content: string; encoding: string }>(
    `/repos/${repo()}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,
    {},
    true
  );
  if (!data) return null;
  return Buffer.from(data.content, data.encoding as BufferEncoding).toString("utf-8");
}

async function createBlob(content: string): Promise<string> {
  const data = await gh<{ sha: string }>(`/repos/${repo()}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
  return data!.sha;
}

async function upsertBranch(branch: string, sha: string): Promise<void> {
  const existing = await getRefSha(branch);
  if (existing === null) {
    await gh(`/repos/${repo()}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
    });
  } else {
    await gh(`/repos/${repo()}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha, force: true }),
    });
  }
}

export async function deleteBranch(branch: string): Promise<void> {
  await gh(`/repos/${repo()}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "DELETE",
  }, true);
}

/* ── High-level staging operations ── */

export interface FileChange {
  path: string;
  content: string;
}

/**
 * Reset the staging branch to the tip of the production branch and commit the
 * given files on top of it, as a single atomic commit. Idempotent: calling it
 * again (e.g. on "Revise") replaces the staging branch's single commit rather
 * than piling commits up.
 */
export async function stageFiles(files: FileChange[], message: string): Promise<string> {
  const base = baseBranch();
  const baseSha = await getRefSha(base);
  if (!baseSha) throw new GitHubError(500, `Base branch "${base}" not found`);

  const baseTreeSha = await getCommitTreeSha(baseSha);

  const tree = await Promise.all(
    files.map(async (f) => ({
      path: f.path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: await createBlob(f.content),
    }))
  );

  const newTree = await gh<{ sha: string }>(`/repos/${repo()}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });

  const commit = await gh<{ sha: string }>(`/repos/${repo()}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree!.sha, parents: [baseSha] }),
  });

  await upsertBranch(STAGING_BRANCH, commit!.sha);
  return commit!.sha;
}

export interface StagingComparison {
  aheadBy: number;
  changedFiles: string[];
}

/** How the staging branch differs from production. Null if staging doesn't exist. */
export async function compareStaging(): Promise<StagingComparison | null> {
  const stagingSha = await getRefSha(STAGING_BRANCH);
  if (!stagingSha) return null;

  const data = await gh<{ ahead_by: number; files?: { filename: string }[] }>(
    `/repos/${repo()}/compare/${encodeURIComponent(baseBranch())}...${encodeURIComponent(STAGING_BRANCH)}`
  );
  return {
    aheadBy: data!.ahead_by,
    changedFiles: (data!.files || []).map((f) => f.filename),
  };
}

export interface PreviewInfo {
  url: string | null;
  state: string; // pending | success | failure | unknown
}

/**
 * Find the Vercel preview deployment for the staging branch by reading the
 * GitHub Deployment statuses Vercel posts. Uses the same GITHUB_TOKEN — no
 * Vercel API token required. Falls back to the CV_PREVIEW_URL env var.
 */
export async function getPreview(): Promise<PreviewInfo> {
  const fallback = process.env.CV_PREVIEW_URL || null;
  try {
    const deployments = await gh<{ id: number }[]>(
      `/repos/${repo()}/deployments?ref=${encodeURIComponent(STAGING_BRANCH)}&per_page=1`
    );
    if (!deployments || deployments.length === 0) {
      return { url: fallback, state: fallback ? "unknown" : "pending" };
    }
    const statuses = await gh<{ state: string; environment_url?: string; target_url?: string }[]>(
      `/repos/${repo()}/deployments/${deployments[0].id}/statuses?per_page=10`
    );
    const latest = statuses && statuses[0];
    if (!latest) return { url: fallback, state: "pending" };
    return {
      url: latest.environment_url || latest.target_url || fallback,
      state: latest.state || "unknown",
    };
  } catch {
    return { url: fallback, state: "unknown" };
  }
}

/** Merge the staging branch into production, then delete the staging branch. */
export async function acceptStaging(message: string): Promise<string> {
  const merge = await gh<{ sha: string }>(`/repos/${repo()}/merges`, {
    method: "POST",
    body: JSON.stringify({
      base: baseBranch(),
      head: STAGING_BRANCH,
      commit_message: message,
    }),
  });
  await deleteBranch(STAGING_BRANCH);
  return merge?.sha ?? "";
}
