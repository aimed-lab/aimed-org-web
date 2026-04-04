'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Mic,
  Award,
  Code2,
  ScrollText,
  Check,
  X,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

/* ── Types ── */

interface DuplicateRef {
  id: number;
  title?: string;
  awardName?: string;
  name?: string;
}

interface ParsedPub {
  title: string;
  authors: string;
  year: number;
  journal?: string;
  doi?: string;
  pubmedId?: string;
  arxivId?: string;
  articleType?: string;
  isDuplicate: boolean;
  duplicateOf: DuplicateRef | null;
}

interface ParsedTalk {
  title: string;
  venue?: string;
  host?: string;
  city?: string;
  country?: string;
  date?: string;
  talkType?: string;
  isDuplicate: boolean;
  duplicateOf: DuplicateRef | null;
}

interface ParsedHonor {
  awardName: string;
  year?: number;
  category?: string;
  issuer?: string;
  description?: string;
  isDuplicate: boolean;
  duplicateOf: DuplicateRef | null;
}

interface ParsedSoftware {
  name: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  category?: string;
  isDuplicate: boolean;
  duplicateOf: DuplicateRef | null;
}

interface ParsedPatent {
  title: string;
  year?: number;
  inventors?: string;
  filingInfo?: string;
  isDuplicate: boolean;
  duplicateOf: DuplicateRef | null;
}

interface ParseSummary {
  publications: { total: number; new: number };
  talks: { total: number; new: number };
  honors: { total: number; new: number };
  software: { total: number; new: number };
  patents: { total: number; new: number };
}

interface ParseResult {
  sourceFilename: string;
  publications: ParsedPub[];
  talks: ParsedTalk[];
  honors: ParsedHonor[];
  software: ParsedSoftware[];
  patents: ParsedPatent[];
  summary: ParseSummary;
}

/* ── Category Config ── */

const categories = [
  { key: 'publications', label: 'Publications', icon: FileText, color: 'blue' },
  { key: 'talks', label: 'Talks & Presentations', icon: Mic, color: 'violet' },
  { key: 'honors', label: 'Honors & Awards', icon: Award, color: 'amber' },
  { key: 'software', label: 'Software & Tools', icon: Code2, color: 'emerald' },
  { key: 'patents', label: 'Patents', icon: ScrollText, color: 'rose' },
] as const;

type CategoryKey = (typeof categories)[number]['key'];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
};

/* ── Main Page ── */

export default function CVUpdatesPage() {
  const [memberInfo, setMemberInfo] = useState<{ name: string; email: string } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<CategoryKey, Set<number>>>({
    publications: new Set(),
    talks: new Set(),
    honors: new Set(),
    software: new Set(),
    patents: new Set(),
  });
  const [expandedSections, setExpandedSections] = useState<Set<CategoryKey>>(new Set(['publications']));
  const [importResult, setImportResult] = useState<Record<string, number> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch member info
  useState(() => {
    fetch('/api/member/profile')
      .then((r) => r.json())
      .then((d) => setMemberInfo({ name: d.name, email: d.email }))
      .catch(() => {});
  });

  const handleUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setError(null);
    setResult(null);
    setImportResult(null);
    setParsing(true);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await fetch('/api/cv-parse', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to parse CV');
        return;
      }

      setResult(data);

      // Auto-select all new (non-duplicate) items
      const newSelected: Record<CategoryKey, Set<number>> = {
        publications: new Set(),
        talks: new Set(),
        honors: new Set(),
        software: new Set(),
        patents: new Set(),
      };

      data.publications?.forEach((p: ParsedPub, i: number) => { if (!p.isDuplicate) newSelected.publications.add(i); });
      data.talks?.forEach((t: ParsedTalk, i: number) => { if (!t.isDuplicate) newSelected.talks.add(i); });
      data.honors?.forEach((h: ParsedHonor, i: number) => { if (!h.isDuplicate) newSelected.honors.add(i); });
      data.software?.forEach((s: ParsedSoftware, i: number) => { if (!s.isDuplicate) newSelected.software.add(i); });
      data.patents?.forEach((p: ParsedPatent, i: number) => { if (!p.isDuplicate) newSelected.patents.add(i); });

      setSelected(newSelected);

      // Expand sections that have results
      const toExpand = new Set<CategoryKey>();
      if (data.publications?.length) toExpand.add('publications');
      if (data.talks?.length) toExpand.add('talks');
      if (data.honors?.length) toExpand.add('honors');
      if (data.software?.length) toExpand.add('software');
      if (data.patents?.length) toExpand.add('patents');
      setExpandedSections(toExpand);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleImport = async () => {
    if (!result) return;

    setImporting(true);
    setError(null);

    const payload: Record<string, unknown> = { sourceFilename: result.sourceFilename };

    // Only include selected items
    payload.publications = result.publications.filter((_, i) => selected.publications.has(i))
      .map(({ isDuplicate, duplicateOf, ...rest }) => rest);
    payload.talks = result.talks.filter((_, i) => selected.talks.has(i))
      .map(({ isDuplicate, duplicateOf, ...rest }) => rest);
    payload.honors = result.honors.filter((_, i) => selected.honors.has(i))
      .map(({ isDuplicate, duplicateOf, ...rest }) => rest);
    payload.software = result.software.filter((_, i) => selected.software.has(i))
      .map(({ isDuplicate, duplicateOf, ...rest }) => rest);
    payload.patents = result.patents.filter((_, i) => selected.patents.has(i))
      .map(({ isDuplicate, duplicateOf, ...rest }) => rest);

    try {
      const res = await fetch('/api/cv-parse', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Import failed');
        return;
      }

      setImportResult(data.imported);
    } catch {
      setError('Network error during import.');
    } finally {
      setImporting(false);
    }
  };

  const toggleItem = (category: CategoryKey, index: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[category]);
      if (set.has(index)) set.delete(index);
      else set.add(index);
      next[category] = set;
      return next;
    });
  };

  const toggleAll = (category: CategoryKey, items: { isDuplicate: boolean }[]) => {
    setSelected((prev) => {
      const next = { ...prev };
      const nonDuplicateIndices = items.map((item, i) => (!item.isDuplicate ? i : -1)).filter((i) => i >= 0);
      const allSelected = nonDuplicateIndices.every((i) => prev[category].has(i));
      if (allSelected) {
        next[category] = new Set();
      } else {
        next[category] = new Set(nonDuplicateIndices);
      }
      return next;
    });
  };

  const toggleSection = (key: CategoryKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalSelected = Object.values(selected).reduce((sum, set) => sum + set.size, 0);

  return (
    <PortalLayout role="member" userName={memberInfo?.name} userEmail={memberInfo?.email}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV Updates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload your latest CV to automatically extract and import publications, talks, honors, software, and patents.
          </p>
        </div>

        {/* Upload zone */}
        {!result && !importResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              dragOver
                ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
                : 'border-slate-300 bg-white hover:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {parsing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                <div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Parsing your CV...</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI is extracting publications, talks, honors, software, and patents. This may take 15-30 seconds.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Drop your CV here or click to upload
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    PDF format supported. AI will parse all sections automatically.
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Select PDF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        )}

        {/* Import success */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-900/20"
          >
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-emerald-800 dark:text-emerald-200">Import Complete</h2>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
              Successfully imported:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {Object.entries(importResult).map(([key, count]) => (
                count > 0 && (
                  <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {count} {key}
                  </span>
                )
              ))}
            </div>
            <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">
              New items are marked as &ldquo;Provisional&rdquo; and will be reviewed before appearing on the public site.
            </p>
            <button
              onClick={() => { setResult(null); setImportResult(null); }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            >
              <Upload className="h-4 w-4" />
              Upload Another CV
            </button>
          </motion.div>
        )}

        {/* Parse results */}
        {result && !importResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Parsed from <span className="font-semibold">{result.sourceFilename}</span>:
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map(({ key, label, color }) => {
                  const s = result.summary[key];
                  if (!s || s.total === 0) return null;
                  return (
                    <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color].badge}`}>
                      {s.new} new / {s.total} {label.toLowerCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Category sections */}
            {categories.map(({ key, label, icon: Icon, color }) => {
              const items = result[key] as Array<{ isDuplicate: boolean; duplicateOf: DuplicateRef | null }>;
              if (!items || items.length === 0) return null;

              const isExpanded = expandedSections.has(key);
              const selectedCount = selected[key].size;
              const colors = colorMap[color];

              return (
                <div key={key} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(key)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left ${colors.bg} transition-colors hover:opacity-90`}
                  >
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                    <span className={`flex-1 text-sm font-semibold ${colors.text}`}>
                      {label}
                      <span className="ml-2 font-normal opacity-70">
                        ({items.length} found, {selectedCount} selected)
                      </span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className={`h-4 w-4 ${colors.text}`} />
                    ) : (
                      <ChevronDown className={`h-4 w-4 ${colors.text}`} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {/* Select all toggle */}
                        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                          <button
                            onClick={() => toggleAll(key, items)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            {items.filter((it) => !it.isDuplicate).every((_, i) => selected[key].has(items.indexOf(items.filter((it2) => !it2.isDuplicate)[i])))
                              ? 'Deselect All New'
                              : 'Select All New'}
                          </button>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                          {items.map((item, idx) => (
                            <ItemRow
                              key={idx}
                              item={item}
                              category={key}
                              index={idx}
                              isSelected={selected[key].has(idx)}
                              onToggle={() => toggleItem(key, idx)}
                              color={color}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Import button bar */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalSelected}</span>{' '}
                items selected for import
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(null); setSelected({ publications: new Set(), talks: new Set(), honors: new Set(), software: new Set(), patents: new Set() }); }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={totalSelected === 0 || importing}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Import Selected
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}

/* ── Item Row Component ── */

function ItemRow({
  item,
  category,
  index,
  isSelected,
  onToggle,
  color,
}: {
  item: Record<string, unknown> & { isDuplicate: boolean; duplicateOf: DuplicateRef | null };
  category: CategoryKey;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  color: string;
}) {
  const colors = colorMap[color];

  // Get display fields based on category
  let title = '';
  let subtitle = '';
  let meta = '';

  switch (category) {
    case 'publications': {
      title = (item.title as string) || '';
      subtitle = (item.authors as string) || '';
      const parts = [];
      if (item.journal) parts.push(item.journal as string);
      if (item.year) parts.push(String(item.year));
      if (item.articleType) parts.push(item.articleType as string);
      meta = parts.join(' · ');
      break;
    }
    case 'talks': {
      title = (item.title as string) || '';
      const parts = [];
      if (item.venue) parts.push(item.venue as string);
      if (item.city) parts.push(item.city as string);
      if (item.talkType) parts.push(item.talkType as string);
      subtitle = parts.join(' · ');
      if (item.date) meta = new Date(item.date as string).toLocaleDateString();
      break;
    }
    case 'honors': {
      title = (item.awardName as string) || '';
      const parts = [];
      if (item.issuer) parts.push(item.issuer as string);
      if (item.year) parts.push(String(item.year));
      subtitle = parts.join(' · ');
      meta = (item.description as string) || '';
      break;
    }
    case 'software': {
      title = (item.name as string) || '';
      subtitle = (item.description as string) || '';
      const parts = [];
      if (item.category) parts.push(item.category as string);
      if (item.url) parts.push(item.url as string);
      meta = parts.join(' · ');
      break;
    }
    case 'patents': {
      title = (item.title as string) || '';
      subtitle = (item.inventors as string) || '';
      const parts = [];
      if (item.year) parts.push(String(item.year));
      if (item.filingInfo) parts.push(item.filingInfo as string);
      meta = parts.join(' · ');
      break;
    }
  }

  return (
    <div
      className={`flex items-start gap-3 px-5 py-3 transition-colors ${
        item.isDuplicate ? 'opacity-50' : isSelected ? 'bg-slate-50 dark:bg-zinc-800/50' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={item.isDuplicate}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          item.isDuplicate
            ? 'border-slate-200 bg-slate-100 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800'
            : isSelected
            ? `${colors.badge} border-transparent`
            : 'border-slate-300 hover:border-slate-400 dark:border-zinc-600 dark:hover:border-zinc-500'
        }`}
      >
        {isSelected && <Check className="h-3.5 w-3.5" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.isDuplicate ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        )}
        {meta && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {meta}
          </p>
        )}
        {item.isDuplicate && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Already exists in database
          </p>
        )}
      </div>
    </div>
  );
}
