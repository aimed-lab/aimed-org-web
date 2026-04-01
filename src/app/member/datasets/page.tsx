'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Database,
  ExternalLink,
  Pencil,
  Trash2,
  ShieldAlert,
  HardDrive,
  Globe,
  Server,
  Link2,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Dataset {
  id: number;
  name: string;
  description: string | null;
  source: string;
  doi: string | null;
  url: string | null;
  filePath: string | null;
  mcpServer: string | null;
  format: string | null;
  size: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const SOURCE_LABELS: Record<string, string> = {
  LOCAL: 'Local',
  DOI: 'DOI',
  MCP_SERVER: 'MCP Server',
  URL: 'URL',
};

const SOURCE_COLORS: Record<string, string> = {
  LOCAL: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  DOI: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  MCP_SERVER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  URL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LOCAL: HardDrive,
  DOI: ExternalLink,
  MCP_SERVER: Server,
  URL: Globe,
};

const FORMATS = ['CSV', 'JSON', 'TSV', 'FASTA', 'BAM', 'VCF', 'Parquet', 'HDF5', 'Other'];
const SOURCES = ['ALL', 'LOCAL', 'DOI', 'MCP_SERVER', 'URL'] as const;

export default function DatasetsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('LOCAL');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [mcpServer, setMcpServer] = useState('');
  const [format, setFormat] = useState('');
  const [size, setSize] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/datasets').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, d]) => {
        if (!m) { setError('Not authenticated'); return; }
        setMember(m);
        setDatasets(d || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName(''); setDescription(''); setSource('LOCAL'); setDoi(''); setUrl('');
    setFilePath(''); setMcpServer(''); setFormat(''); setSize(''); setTags('');
    setEditingDataset(null);
  }

  function openAdd() { resetForm(); setShowModal(true); }

  function openEdit(ds: Dataset) {
    setEditingDataset(ds);
    setName(ds.name); setDescription(ds.description || ''); setSource(ds.source);
    setDoi(ds.doi || ''); setUrl(ds.url || ''); setFilePath(ds.filePath || '');
    setMcpServer(ds.mcpServer || ''); setFormat(ds.format || ''); setSize(ds.size || '');
    setTags(ds.tags || '');
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const payload = {
      name: name.trim(), description: description.trim() || null, source,
      doi: doi.trim() || null, url: url.trim() || null, filePath: filePath.trim() || null,
      mcpServer: mcpServer.trim() || null, format: format || null, size: size.trim() || null,
      tags: tags.trim() || null,
    };

    try {
      if (editingDataset) {
        const res = await fetch(`/api/member/datasets/${editingDataset.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setDatasets((prev) => prev.map((d) => (d.id === editingDataset.id ? updated : d)));
          setShowModal(false); resetForm();
        }
      } else {
        const res = await fetch('/api/member/datasets', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const ds = await res.json();
          setDatasets((prev) => [ds, ...prev]);
          setShowModal(false); resetForm();
        }
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function deleteDataset(id: number) {
    if (!confirm('Delete this dataset?')) return;
    try {
      const res = await fetch(`/api/member/datasets/${id}`, { method: 'DELETE' });
      if (res.ok) setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch { /* ignore */ }
  }

  const filtered = datasets.filter((d) => activeFilter === 'ALL' || d.source === activeFilter);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">Authentication required.</p>
        <button onClick={() => router.push('/member/activate')} className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">Go to Activation</button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Datasets</h2>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Add Dataset
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All' : SOURCE_LABELS[s]}
              {s !== 'ALL' && (
                <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-zinc-700">
                  {datasets.filter((d) => d.source === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dataset cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Database className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No datasets found. Add your first dataset.</p>
            </div>
          ) : (
            filtered.map((ds) => {
              const SourceIcon = SOURCE_ICONS[ds.source] || HardDrive;
              return (
                <motion.div key={ds.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{ds.name}</p>
                        {ds.format && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {ds.format}
                          </span>
                        )}
                        {ds.size && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{ds.size}</span>
                        )}
                      </div>
                      {ds.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{ds.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[ds.source]}`}>
                          <SourceIcon className="h-3 w-3" />
                          {SOURCE_LABELS[ds.source]}
                        </span>
                        {ds.mcpServer && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">MCP: {ds.mcpServer}</span>
                        )}
                      </div>
                      {ds.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ds.tags.split(',').map((tag, i) => (
                            <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {ds.doi && (
                        <a href={`https://doi.org/${ds.doi}`} target="_blank" rel="noopener noreferrer" title="DOI" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800">
                          <Link2 className="h-4 w-4" />
                        </a>
                      )}
                      {ds.url && (
                        <a href={ds.url} target="_blank" rel="noopener noreferrer" title="URL" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(ds)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteDataset(ds.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => { setShowModal(false); resetForm(); }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editingDataset ? 'Edit Dataset' : 'Add Dataset'}
                  </h3>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Dataset name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Describe the dataset" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source Type</label>
                    <select value={source} onChange={(e) => setSource(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                      <option value="LOCAL">Local File</option>
                      <option value="DOI">DOI</option>
                      <option value="MCP_SERVER">MCP Server</option>
                      <option value="URL">URL</option>
                    </select>
                  </div>
                  {source === 'DOI' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">DOI</label>
                      <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="10.xxxx/xxxxx" />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">File Path / Box Path</label>
                    <input type="text" value={filePath} onChange={(e) => setFilePath(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="/path/to/file or Box URL" />
                  </div>
                  {source === 'MCP_SERVER' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">MCP Server</label>
                      <input type="text" value={mcpServer} onChange={(e) => setMcpServer(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="MCP server identifier" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Format</label>
                      <select value={format} onChange={(e) => setFormat(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="">Select format</option>
                        {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Size</label>
                      <input type="text" value={size} onChange={(e) => setSize(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="e.g. 2.3 GB" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="comma, separated, tags" />
                  </div>
                  <button type="submit" disabled={submitting || !name.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                    {submitting ? 'Saving...' : editingDataset ? 'Update Dataset' : 'Add Dataset'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
}
