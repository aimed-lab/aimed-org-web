'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Wrench,
  Pencil,
  Trash2,
  ShieldAlert,
  FolderGit,
  Globe,
  Server,
  Container,
  Code2,
  Laptop,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Tool {
  id: number;
  name: string;
  description: string | null;
  toolType: string;
  url: string | null;
  githubRepo: string | null;
  dockerImage: string | null;
  apiEndpoint: string | null;
  mcpServer: string | null;
  status: string;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const TYPE_LABELS: Record<string, string> = {
  GITHUB: 'GitHub',
  JUPYTER: 'Jupyter',
  WEB_APP: 'Web App',
  API: 'API',
  MCP_SERVER: 'MCP Server',
  VM: 'VM',
  DOCKER: 'Docker',
  OTHER: 'Other',
};

const TYPE_COLORS: Record<string, string> = {
  GITHUB: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  JUPYTER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  WEB_APP: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  API: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  MCP_SERVER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  VM: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  DOCKER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  OTHER: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300',
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GITHUB: FolderGit,
  JUPYTER: Code2,
  WEB_APP: Globe,
  API: Server,
  MCP_SERVER: Cpu,
  VM: Laptop,
  DOCKER: Container,
  OTHER: Wrench,
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  IN_DEVELOPMENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-slate-400',
};

const TYPES = ['ALL', 'GITHUB', 'JUPYTER', 'WEB_APP', 'API', 'MCP_SERVER', 'VM', 'DOCKER'] as const;

export default function ToolsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toolType, setToolType] = useState('GITHUB');
  const [url, setUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [dockerImage, setDockerImage] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [mcpServer, setMcpServer] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/tools').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, t]) => {
        if (!m) { router.push('/member/activate'); return; }
        setMember(m);
        setTools(t || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName(''); setDescription(''); setToolType('GITHUB'); setUrl('');
    setGithubRepo(''); setDockerImage(''); setApiEndpoint(''); setMcpServer('');
    setStatus('ACTIVE'); setTags(''); setEditingTool(null);
  }

  function openAdd() { resetForm(); setShowModal(true); }

  function openEdit(tool: Tool) {
    setEditingTool(tool);
    setName(tool.name); setDescription(tool.description || ''); setToolType(tool.toolType);
    setUrl(tool.url || ''); setGithubRepo(tool.githubRepo || ''); setDockerImage(tool.dockerImage || '');
    setApiEndpoint(tool.apiEndpoint || ''); setMcpServer(tool.mcpServer || '');
    setStatus(tool.status); setTags(tool.tags || '');
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const payload = {
      name: name.trim(), description: description.trim() || null, toolType, url: url.trim() || null,
      githubRepo: githubRepo.trim() || null, dockerImage: dockerImage.trim() || null,
      apiEndpoint: apiEndpoint.trim() || null, mcpServer: mcpServer.trim() || null,
      status, tags: tags.trim() || null,
    };

    try {
      if (editingTool) {
        const res = await fetch(`/api/member/tools/${editingTool.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setTools((prev) => prev.map((t) => (t.id === editingTool.id ? updated : t)));
          setShowModal(false); resetForm();
        }
      } else {
        const res = await fetch('/api/member/tools', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const tool = await res.json();
          setTools((prev) => [tool, ...prev]);
          setShowModal(false); resetForm();
        }
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function deleteTool(id: number) {
    if (!confirm('Delete this tool?')) return;
    try {
      const res = await fetch(`/api/member/tools/${id}`, { method: 'DELETE' });
      if (res.ok) setTools((prev) => prev.filter((t) => t.id !== id));
    } catch { /* ignore */ }
  }

  const filtered = tools.filter((t) => activeFilter === 'ALL' || t.toolType === activeFilter);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting...</p>
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
            <Wrench className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tools</h2>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Add Tool
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === t
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Tool cards grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <Wrench className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No tools found. Add your first tool.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => {
              const TypeIcon = TYPE_ICONS[tool.toolType] || Wrench;
              return (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{tool.name}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${STATUS_COLORS[tool.status]}`}>
                      {tool.status === 'IN_DEVELOPMENT' ? 'Dev' : tool.status.charAt(0) + tool.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {tool.description && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{tool.description}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[tool.toolType]}`}>
                      {TYPE_LABELS[tool.toolType]}
                    </span>
                  </div>
                  {/* Links */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {tool.githubRepo && (
                      <a href={`https://github.com/${tool.githubRepo}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <FolderGit className="h-3 w-3" /> {tool.githubRepo}
                      </a>
                    )}
                    {tool.url && (
                      <a href={tool.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <ExternalLink className="h-3 w-3" /> URL
                      </a>
                    )}
                    {tool.dockerImage && (
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Container className="h-3 w-3" /> {tool.dockerImage}
                      </span>
                    )}
                    {tool.apiEndpoint && (
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Server className="h-3 w-3" /> API
                      </span>
                    )}
                  </div>
                  {tool.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tool.tags.split(',').map((tag, i) => (
                        <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <button onClick={() => openEdit(tool)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteTool(tool.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

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
                    {editingTool ? 'Edit Tool' : 'Add Tool'}
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
                      placeholder="Tool name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Describe the tool" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tool Type</label>
                      <select value={toolType} onChange={(e) => setToolType(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="GITHUB">GitHub Repo</option>
                        <option value="JUPYTER">Jupyter Notebook</option>
                        <option value="WEB_APP">Web Application</option>
                        <option value="API">API</option>
                        <option value="MCP_SERVER">MCP Server</option>
                        <option value="VM">VM</option>
                        <option value="DOCKER">Docker Container</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="ACTIVE">Active</option>
                        <option value="IN_DEVELOPMENT">In Development</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Repo</label>
                    <input type="text" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="org/repo" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Docker Image</label>
                    <input type="text" value={dockerImage} onChange={(e) => setDockerImage(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="image:tag" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">API Endpoint</label>
                    <input type="text" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="https://api..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">MCP Server</label>
                    <input type="text" value={mcpServer} onChange={(e) => setMcpServer(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="MCP server identifier" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="comma, separated, tags" />
                  </div>
                  <button type="submit" disabled={submitting || !name.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                    {submitting ? 'Saving...' : editingTool ? 'Update Tool' : 'Add Tool'}
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
