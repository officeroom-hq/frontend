import { useMemo, useState, useRef } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, type FileItem, type FolderItem, type UploadProgress } from '../../api';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { AppSidebar, type AppSidebarLink } from '../../components/AppSidebar';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, PillFilter, ProgressBar, StatusChip, fileStatusTone, FileKindIcon, AIInsightCard, IconButton } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useSession } from '../../lib/session';
import { bytes } from '../../lib/format';

type View = 'list' | 'grid';
const VIEWS = ['list', 'grid'] as const;
const FILES_LINKS: AppSidebarLink[] = [
  { label: 'All files', to: '/files', capability: 'files:view', icon: <Folder size={13} aria-hidden="true" /> },
  { label: 'Messages', to: '/messages', capability: 'messages:view', icon: <FileText size={13} aria-hidden="true" /> },
];

/** Builds a nested tree from the flat folder list. */
function buildTree(folders: FolderItem[]): (FolderItem & { children: FolderItem[] })[] {
  const byParent = new Map<string | null, FolderItem[]>();
  folders.forEach((f) => byParent.set(f.parentId, [...(byParent.get(f.parentId) ?? []), f]));
  const attach = (f: FolderItem): FolderItem & { children: FolderItem[] } => ({ ...f, children: (byParent.get(f.id) ?? []).map(attach) });
  return (byParent.get(null) ?? []).map(attach);
}

function FolderTree({ nodes, selected, onSelect, depth = 0 }: { nodes: ReturnType<typeof buildTree>; selected: string | null; onSelect: (id: string) => void; depth?: number }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? 'Folders' : undefined} className="space-y-0.5">
      {nodes.map((n) => {
        const hasKids = n.children.length > 0;
        const isOpen = open[n.id] ?? true;
        const active = selected === n.id;
        return (
          <li key={n.id} role="treeitem" aria-expanded={hasKids ? isOpen : undefined} aria-selected={active}>
            <div className={`flex items-center gap-1 rounded-control pr-1.5 ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`} style={{ paddingLeft: depth * 12 + 4 }}>
              {hasKids ? (
                <button type="button" aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${n.name}`} onClick={() => setOpen((o) => ({ ...o, [n.id]: !isOpen }))} className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-ink">
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              ) : <span className="w-5" aria-hidden="true" />}
              <button type="button" onClick={() => onSelect(n.id)} className="flex flex-1 items-center gap-1.5 py-1 text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded">
                {active ? <FolderOpen size={13} aria-hidden="true" /> : <Folder size={13} aria-hidden="true" />}
                {n.name}
              </button>
            </div>
            {hasKids && isOpen && <FolderTree nodes={n.children as ReturnType<typeof buildTree>} selected={selected} onSelect={onSelect} depth={depth + 1} />}
          </li>
        );
      })}
    </ul>
  );
}

function DetailsPanel({ file, onClose }: { file: FileItem; onClose: () => void }) {
  return (
    <aside aria-label="File details" className="w-full shrink-0 space-y-3 rounded-card border border-line bg-white p-4 shadow-card lg:w-64">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileKindIcon kind={file.kind} />
          <p className="truncate text-[12px] font-semibold text-ink" title={file.name}>{file.name}</p>
        </div>
        <IconButton label="Close details" onClick={onClose}><X size={13} /></IconButton>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-caption">
        <dt className="text-muted">Type</dt><dd>{file.kind}</dd>
        <dt className="text-muted">Size</dt><dd>{file.sizeBytes ? bytes(file.sizeBytes) : file.size ?? '-'}</dd>
        <dt className="text-muted">Owner</dt><dd>{file.owner ?? 'Unknown'}</dd>
        <dt className="text-muted">Modified</dt><dd>{file.lastModified}</dd>
        <dt className="text-muted">Status</dt><dd><StatusChip tone={fileStatusTone(file.status)}>{file.status}</StatusChip></dd>
      </dl>
      <AIInsightCard title="Suggested next step" body={`This ${file.kind.toLowerCase()} can be summarised for the Finance team's monthly review.`} actions={[{ label: 'Summarise', onClick: () => undefined }]} />
    </aside>
  );
}

function UploadPanel({ folderId, onDone }: { folderId: string; onDone: (f: FileItem) => void }) {
  const { can } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadProgress[]>([]);

  if (!can('files:upload')) return null;

  const upload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const id = `${file.name}-${Date.now()}`;
      setItems((s) => [...s, { id, name: file.name, progress: 0, status: 'uploading' }]);
      try {
        const created = await api.uploadFile(folderId, { name: file.name, sizeBytes: file.size }, (pct) =>
          setItems((s) => s.map((x) => (x.id === id ? { ...x, progress: pct } : x))),
        );
        setItems((s) => s.map((x) => (x.id === id ? { ...x, progress: 100, status: 'done' } : x)));
        onDone(created);
      } catch (e) {
        setItems((s) => s.map((x) => (x.id === id ? { ...x, status: 'failed', error: e instanceof Error ? e.message : 'Upload failed.' } : x)));
      }
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" multiple className="sr-only" id="file-upload" onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} />
      <label htmlFor="file-upload" className="flex cursor-pointer items-center gap-2 rounded-control border border-dashed border-blue-300 bg-blue-50/50 px-3 py-2 text-caption text-blue-800 hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400">
        <Upload size={13} aria-hidden="true" /> Upload to this folder
      </label>
      {items.length > 0 && (
        <ul className="space-y-1.5" aria-live="polite">
          {items.map((u) => (
            <li key={u.id} className="space-y-1 rounded-control border border-line p-2">
              <div className="flex items-center justify-between gap-2 text-caption">
                <span className="truncate">{u.name}</span>
                {u.status === 'done' ? <CheckCircle2 size={12} className="text-emerald-600" aria-label="Uploaded" /> : u.status === 'failed' ? <AlertCircle size={12} className="text-red-600" aria-label="Failed" /> : <span className="text-micro text-muted">{u.progress}%</span>}
              </div>
              {u.status === 'failed' ? <p className="text-micro text-red-600">{u.error}</p> : <ProgressBar value={u.progress} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FilesPage() {
  const { can } = useSession();
  const folders = useAsync(() => api.listFolders(), []);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [extraFiles, setExtraFiles] = useState<FileItem[]>([]);

  const folderId = selectedFolder ?? folders.data?.[0]?.id ?? null;
  const files = useAsync(() => (folderId ? api.listFiles(folderId) : Promise.resolve([])), [folderId]);
  const tree = useMemo(() => buildTree(folders.data ?? []), [folders.data]);
  const folderName = folders.data?.find((f) => f.id === folderId)?.path ?? '';

  const rows = [...extraFiles.filter((f) => f.folderId === folderId), ...(files.data ?? [])];

  return (
    <SidebarLayout sidebar={<AppSidebar links={FILES_LINKS} title="Files" />} searchPlaceholder="Search files">
      <PageHeader
        title="Files"
        subtitle={folderName ? `Folder: ${folderName}` : 'Department folders and documents'}
        actions={<PillFilter items={VIEWS} value={view} onChange={setView} />}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 space-y-3 lg:w-56">
          <Card title="Folders" bodyClassName="p-2">
            {folders.loading ? <LoadingState rows={5} label="Loading folders" /> : folders.error ? <ErrorState error={folders.error} onRetry={folders.reload} /> : (
              <FolderTree nodes={tree} selected={folderId} onSelect={(id) => { setSelectedFolder(id); setSelectedFile(null); }} />
            )}
          </Card>
          {folderId && <Card title="Upload" bodyClassName="p-3">{can('files:upload') ? <UploadPanel folderId={folderId} onDone={(f) => setExtraFiles((x) => [f, ...x])} /> : <p className="text-caption text-muted">Your role can view files but not upload them.</p>}</Card>}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <Card title={folderName || 'Files'} bodyClassName="p-0">
            {files.loading ? (
              <div className="p-4"><LoadingState rows={5} label="Loading files" /></div>
            ) : files.error ? (
              <div className="p-4"><ErrorState error={files.error} onRetry={files.reload} /></div>
            ) : rows.length === 0 ? (
              <EmptyState title="This folder is empty" body="Upload a file to start, or pick another folder." />
            ) : view === 'list' ? (
              <table className="w-full border-collapse text-left text-caption" aria-label="Files in folder">
                <thead className="bg-slate-50 text-micro uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Name</th>
                    <th scope="col" className="px-2 py-2 font-semibold">Modified</th>
                    <th scope="col" className="px-2 py-2 font-semibold">Size</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id} tabIndex={0} aria-selected={selectedFile?.id === f.id} onClick={() => setSelectedFile(f)} onKeyDown={(e) => e.key === 'Enter' && setSelectedFile(f)} className={`cursor-pointer border-t border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${selectedFile?.id === f.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-2"><span className="flex items-center gap-2"><FileKindIcon kind={f.kind} />{f.name}</span></td>
                      <td className="px-2 py-2 text-muted">{f.lastModified}</td>
                      <td className="px-2 py-2 text-muted">{f.sizeBytes ? bytes(f.sizeBytes) : f.size ?? '-'}</td>
                      <td className="px-4 py-2"><StatusChip tone={fileStatusTone(f.status)}>{f.status}</StatusChip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 xl:grid-cols-4" aria-label="Files in folder">
                {rows.map((f) => (
                  <li key={f.id}>
                    <button type="button" aria-pressed={selectedFile?.id === f.id} onClick={() => setSelectedFile(f)} className={`flex w-full flex-col items-start gap-2 rounded-card border p-3 text-left text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${selectedFile?.id === f.id ? 'border-blue-300 bg-blue-50' : 'border-line hover:bg-slate-50'}`}>
                      <FileKindIcon kind={f.kind} />
                      <span className="w-full truncate font-medium">{f.name}</span>
                      <span className="text-micro text-muted">{f.lastModified}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {selectedFile && <DetailsPanel file={selectedFile} onClose={() => setSelectedFile(null)} />}
      </div>
    </SidebarLayout>
  );
}
