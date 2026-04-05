'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Shield,
  Pencil,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  FileCheck,
  Scale,
  GraduationCap,
  KeyRound,
  FileSignature,
  FileWarning,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface ComplianceDoc {
  id: number;
  docType: string;
  title: string;
  description: string | null;
  issuer: string | null;
  fileUrl: string | null;
  expiresAt: string | null;
  status: string;
  protocolNum: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  SOFTWARE_LICENSE: 'Software License',
  IRB_PROTOCOL: 'IRB Protocol',
  TRAINING_CERT: 'Training Cert',
  LICENSE: 'License',
  NDA: 'NDA',
  DUA: 'Data Use Agreement',
  OTHER: 'Other',
};

const DOC_TYPE_COLORS: Record<string, string> = {
  SOFTWARE_LICENSE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IRB_PROTOCOL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  TRAINING_CERT: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  LICENSE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  NDA: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DUA: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  OTHER: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
};

const DOC_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SOFTWARE_LICENSE: KeyRound,
  IRB_PROTOCOL: Shield,
  TRAINING_CERT: GraduationCap,
  LICENSE: FileCheck,
  NDA: FileSignature,
  DUA: Scale,
  OTHER: FileWarning,
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-slate-400',
};

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'LICENSES', label: 'Licenses', types: ['SOFTWARE_LICENSE', 'LICENSE'] },
  { key: 'IRB', label: 'IRB', types: ['IRB_PROTOCOL'] },
  { key: 'TRAINING', label: 'Training', types: ['TRAINING_CERT'] },
  { key: 'NDAS', label: 'NDAs', types: ['NDA', 'DUA'] },
] as const;

function getExpirationStatus(expiresAt: string | null): 'valid' | 'expiring' | 'expired' | 'none' {
  if (!expiresAt) return 'none';
  const exp = new Date(expiresAt);
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (exp < now) return 'expired';
  if (exp.getTime() - now.getTime() < thirtyDays) return 'expiring';
  return 'valid';
}

const EXPIRATION_STYLES: Record<string, string> = {
  valid: 'text-green-600 dark:text-green-400',
  expiring: 'text-amber-600 dark:text-amber-400',
  expired: 'text-red-600 dark:text-red-400',
  none: 'text-slate-500 dark:text-slate-400',
};

export default function CompliancePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ComplianceDoc | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Form
  const [docType, setDocType] = useState('SOFTWARE_LICENSE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [protocolNum, setProtocolNum] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/compliance').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, d]) => {
        if (!m) { router.push('/member/activate'); return; }
        setMember(m);
        setDocs(d || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setDocType('SOFTWARE_LICENSE'); setTitle(''); setDescription(''); setIssuer('');
    setFileUrl(''); setExpiresAt(''); setStatus('ACTIVE'); setProtocolNum(''); setNotes('');
    setEditingDoc(null);
  }

  function openAdd() { resetForm(); setShowModal(true); }

  function openEdit(doc: ComplianceDoc) {
    setEditingDoc(doc);
    setDocType(doc.docType); setTitle(doc.title); setDescription(doc.description || '');
    setIssuer(doc.issuer || ''); setFileUrl(doc.fileUrl || '');
    setExpiresAt(doc.expiresAt ? doc.expiresAt.split('T')[0] : '');
    setStatus(doc.status); setProtocolNum(doc.protocolNum || ''); setNotes(doc.notes || '');
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const payload = {
      docType, title: title.trim(), description: description.trim() || null,
      issuer: issuer.trim() || null, fileUrl: fileUrl.trim() || null,
      expiresAt: expiresAt || null, status,
      protocolNum: protocolNum.trim() || null, notes: notes.trim() || null,
    };

    try {
      if (editingDoc) {
        const res = await fetch(`/api/member/compliance/${editingDoc.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setDocs((prev) => prev.map((d) => (d.id === editingDoc.id ? updated : d)));
          setShowModal(false); resetForm();
        }
      } else {
        const res = await fetch('/api/member/compliance', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const doc = await res.json();
          setDocs((prev) => [doc, ...prev]);
          setShowModal(false); resetForm();
        }
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function deleteDoc(id: number) {
    if (!confirm('Delete this document?')) return;
    try {
      const res = await fetch(`/api/member/compliance/${id}`, { method: 'DELETE' });
      if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch { /* ignore */ }
  }

  const expiringDocs = docs.filter((d) => {
    const s = getExpirationStatus(d.expiresAt);
    return s === 'expiring' || s === 'expired';
  });

  const filtered = docs.filter((d) => {
    if (activeFilter === 'ALL') return true;
    const tab = FILTER_TABS.find((t) => t.key === activeFilter);
    if (tab && 'types' in tab) return (tab as { types: readonly string[] }).types.includes(d.docType);
    return true;
  });

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
            <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ethics & Legal</h2>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Add Document
          </button>
        </div>

        {/* Expiration alert */}
        {expiringDocs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Attention: {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expiring or expired
                </p>
                <ul className="mt-1 space-y-0.5">
                  {expiringDocs.map((d) => (
                    <li key={d.id} className="text-xs text-amber-700 dark:text-amber-300">
                      {d.title} - {getExpirationStatus(d.expiresAt) === 'expired' ? 'EXPIRED' : `Expires ${new Date(d.expiresAt!).toLocaleDateString()}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Shield className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No compliance documents found.</p>
            </div>
          ) : (
            filtered.map((doc) => {
              const TypeIcon = DOC_TYPE_ICONS[doc.docType] || FileWarning;
              const expStatus = getExpirationStatus(doc.expiresAt);
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DOC_TYPE_COLORS[doc.docType]}`}>
                          {DOC_TYPE_LABELS[doc.docType]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[doc.status]}`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{doc.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {doc.issuer && <span>Issuer: {doc.issuer}</span>}
                        {doc.protocolNum && <span>Protocol: {doc.protocolNum}</span>}
                        {doc.expiresAt && (
                          <span className={EXPIRATION_STYLES[expStatus]}>
                            {expStatus === 'expired' ? 'Expired: ' : 'Expires: '}
                            {new Date(doc.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="View file"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(doc)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteDoc(doc.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Templates & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Templates & Reference Documents
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'IRB Protocol Template', desc: 'Standard IRB submission template for human subjects research', icon: Shield, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' },
              { title: 'Copyright Transfer Form', desc: 'Publisher copyright assignment template', icon: FileSignature, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
              { title: 'OSDD2 Agreement', desc: 'Open-source drug discovery data sharing agreement', icon: Scale, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20' },
              { title: 'Data Use Agreement', desc: 'Template for institutional data sharing agreements', icon: KeyRound, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
              { title: 'NDA Template', desc: 'Non-disclosure agreement for collaborations', icon: FileWarning, color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20' },
              { title: 'CITI Training Link', desc: 'Collaborative Institutional Training Initiative portal', icon: GraduationCap, color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' },
            ].map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <a
                  key={tmpl.title}
                  href="#"
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  title="Link will be configured by admin"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tmpl.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      {tmpl.title}
                      <ExternalLink className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tmpl.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>

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
                    {editingDoc ? 'Edit Document' : 'Add Document'}
                  </h3>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Document Type</label>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                      <option value="SOFTWARE_LICENSE">Software License</option>
                      <option value="IRB_PROTOCOL">IRB Protocol</option>
                      <option value="TRAINING_CERT">Training Certificate</option>
                      <option value="LICENSE">Professional License</option>
                      <option value="NDA">NDA</option>
                      <option value="DUA">Data Use Agreement</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Document title" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Brief description" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Issuer</label>
                      <input type="text" value={issuer} onChange={(e) => setIssuer(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="e.g. CITI Program" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Protocol / Ref #</label>
                      <input type="text" value={protocolNum} onChange={(e) => setProtocolNum(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="IRB-XXXXX" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Expiration Date</label>
                      <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="PENDING">Pending</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">File URL (Box link)</label>
                    <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Additional notes" />
                  </div>
                  <button type="submit" disabled={submitting || !title.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                    {submitting ? 'Saving...' : editingDoc ? 'Update Document' : 'Add Document'}
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
