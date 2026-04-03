'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Upload,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  ShieldAlert,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  FileText,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Publication {
  id: number;
  title: string;
  authors: string;
  year: number;
  journal: string | null;
  abstract: string | null;
  doi: string | null;
  pubmedId: string | null;
  arxivId: string | null;
  pdfUrl: string | null;
  tags: string | null;
  researchLineage: string | null;
  articleType: string | null;
  featured: boolean;
  curationStatus: string;
  sourceCV: string | null;
  createdAt: string;
}

interface ParseResult {
  publication: {
    title: string;
    authors: string;
    year: number;
    journal?: string;
    doi?: string;
    pubmedId?: string;
    arxivId?: string;
    articleType?: string;
  };
  status: 'new' | 'duplicate' | 'error';
  duplicateOf?: { id: number; title: string; matchType: string };
}

type TabFilter = 'ALL' | 'PROVISIONAL' | 'VERIFIED';

export default function AdminPublicationsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<TabFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPub, setExpandedPub] = useState<number | null>(null);

  // CV Parse state
  const [showParse, setShowParse] = useState(false);
  const [parseFile, setParseFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResults, setParseResults] = useState<ParseResult[] | null>(null);
  const [parseFilename, setParseFilename] = useState('');
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const fetchPublications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (tabFilter !== 'ALL') params.set('status', tabFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/publications?${params}`);
      if (res.ok) {
        setPublications(await res.json());
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [tabFilter, searchQuery]);

  useEffect(() => { fetchPublications(); }, [fetchPublications]);

  async function handleParseCv() {
    if (!parseFile) return;
    setParsing(true);
    setParseResults(null);
    try {
      const formData = new FormData();
      formData.append('cv', parseFile);
      const res = await fetch('/api/admin/cv-parse', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setParseResults(data.results);
        setParseFilename(data.sourceFilename);
        // Auto-select all new (non-duplicate) items
        const newIdxs = new Set<number>();
        data.results.forEach((r: ParseResult, i: number) => {
          if (r.status === 'new') newIdxs.add(i);
        });
        setSelectedForImport(newIdxs);
      } else {
        alert(data.error || 'Parsing failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setParsing(false);
    }
  }

  async function handleImportSelected() {
    if (!parseResults || selectedForImport.size === 0) return;
    setImporting(true);
    try {
      const pubs = Array.from(selectedForImport).map((i) => parseResults[i].publication);
      const res = await fetch('/api/admin/cv-parse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publications: pubs, sourceFilename: parseFilename }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Imported ${data.imported} publications (${data.skipped} duplicates skipped).`);
        setShowParse(false);
        setParseResults(null);
        setParseFile(null);
        fetchPublications();
      } else {
        alert(data.error || 'Import failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setImporting(false);
    }
  }

  async function handleVerify(id: number) {
    try {
      const res = await fetch(`/api/admin/publications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
      if (res.ok) fetchPublications();
    } catch { /* ignore */ }
  }

  async function handleUnverify(id: number) {
    try {
      const res = await fetch(`/api/admin/publications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unverify' }),
      });
      if (res.ok) fetchPublications();
    } catch { /* ignore */ }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this publication? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPublications();
    } catch { /* ignore */ }
  }

  async function handleBulkVerify() {
    const provisional = publications.filter((p) => p.curationStatus === 'PROVISIONAL');
    if (provisional.length === 0) return;
    if (!confirm(`Verify all ${provisional.length} provisional publications?`)) return;
    for (const p of provisional) {
      await fetch(`/api/admin/publications/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
    }
    fetchPublications();
  }

  if (authenticated === null || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Login required</h2>
        <button onClick={() => router.push('/admin')} className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">
          Go to Login
        </button>
      </div>
    );
  }

  const provisionalCount = publications.filter((p) => p.curationStatus === 'PROVISIONAL').length;
  const verifiedCount = publications.filter((p) => p.curationStatus === 'VERIFIED').length;

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Publications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {publications.length} total &middot; {verifiedCount} verified &middot; {provisionalCount} provisional
            </p>
          </div>
          <div className="flex gap-2">
            {provisionalCount > 0 && (
              <button
                onClick={handleBulkVerify}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
              >
                <CheckCircle className="h-4 w-4" />
                Verify All ({provisionalCount})
              </button>
            )}
            <button
              onClick={() => { setShowParse(true); setParseResults(null); setParseFile(null); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Upload className="h-4 w-4" />
              Upload CV & Parse
            </button>
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, authors, journal..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 w-fit">
            {(['ALL', 'PROVISIONAL', 'VERIFIED'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tabFilter === tab
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'PROVISIONAL' ? 'Provisional' : 'Verified'}
              </button>
            ))}
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-2">
          {publications.map((pub) => (
            <div key={pub.id} className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedPub(expandedPub === pub.id ? null : pub.id)}
              >
                {expandedPub === pub.id ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{pub.title}</h3>
                    {pub.curationStatus === 'PROVISIONAL' ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> Provisional
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {pub.sourceCV && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        CV parsed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {pub.authors} &middot; {pub.year} &middot; {pub.journal || 'No journal'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {pub.curationStatus === 'PROVISIONAL' ? (
                    <button
                      onClick={() => handleVerify(pub.id)}
                      className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      title="Verify"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnverify(pub.id)}
                      className="rounded p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      title="Unverify"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(pub.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Expanded Detail */}
              {expandedPub === pub.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-slate-500">DOI:</span>{' '}
                      {pub.doi ? (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                          {pub.doi}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">PubMed:</span>{' '}
                      {pub.pubmedId ? (
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pubmedId}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                          {pub.pubmedId}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div><span className="font-medium text-slate-500">Type:</span> {pub.articleType || '—'}</div>
                    <div><span className="font-medium text-slate-500">Tags:</span> {pub.tags || '—'}</div>
                  </div>
                  {pub.abstract && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-slate-500">Abstract:</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-3">{pub.abstract}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    Full author list: {pub.authors}
                  </p>
                </div>
              )}
            </div>
          ))}
          {publications.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No publications found.</p>
            </div>
          )}
        </div>

        {/* CV Parse Modal */}
        <AnimatePresence>
          {showParse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setShowParse(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    AI-Powered CV Parser
                  </h3>
                  <button onClick={() => setShowParse(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {!parseResults ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Upload a CV (PDF) and the AI will extract all publications, check for duplicates, and let you import new ones as provisional entries.
                    </p>
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {parseFile ? parseFile.name : 'Choose a PDF file'}
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setParseFile(e.target.files?.[0] || null)}
                        className="mt-3 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleParseCv}
                      disabled={!parseFile || parsing}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {parsing ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Parsing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Parse Publications
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3 text-sm">
                      <span className="rounded bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        {parseResults.filter((r) => r.status === 'new').length} new
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {parseResults.filter((r) => r.status === 'duplicate').length} duplicates
                      </span>
                      <span className="text-slate-500">{parseResults.length} total parsed</span>
                    </div>

                    <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                      {parseResults.map((r, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                            r.status === 'duplicate'
                              ? 'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10'
                              : 'border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                          }`}
                        >
                          {r.status === 'new' && (
                            <input
                              type="checkbox"
                              checked={selectedForImport.has(i)}
                              onChange={(e) => {
                                const next = new Set(selectedForImport);
                                if (e.target.checked) next.add(i);
                                else next.delete(i);
                                setSelectedForImport(next);
                              }}
                              className="mt-0.5 shrink-0"
                            />
                          )}
                          {r.status === 'duplicate' && (
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{r.publication.title}</p>
                            <p className="text-slate-500 mt-0.5">{r.publication.authors?.substring(0, 80)}{(r.publication.authors?.length || 0) > 80 ? '...' : ''} &middot; {r.publication.year}</p>
                            {r.status === 'duplicate' && r.duplicateOf && (
                              <p className="text-amber-600 mt-0.5">
                                Duplicate ({r.duplicateOf.matchType} match): &ldquo;{r.duplicateOf.title.substring(0, 60)}...&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setParseResults(null); setParseFile(null); }}
                        className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
                      >
                        Parse Another
                      </button>
                      <button
                        onClick={handleImportSelected}
                        disabled={selectedForImport.size === 0 || importing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                      >
                        {importing ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Import {selectedForImport.size} Selected
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
}
