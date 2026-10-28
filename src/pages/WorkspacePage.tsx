import { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Search, ChevronDown, Share2, Plus, Save, Zap, Grid3x3, Eye } from 'lucide-react';
import { api } from '../api';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { AICopilotPanel } from '../components/AICopilotPanel';
import { DonutChart } from '../components/ui/DonutChart';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Card, PillFilter, Loading, ErrorNote, StatusChip, FileKindIcon, ViewAll } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { TONE_HEX } from '../lib/tones';
import type { FileItem, WorkbookSheetRow } from '../api/types';

const EDITOR_TABS = ['Excel Editor', 'Document Editor', 'PDF Viewer', 'All Files', 'Data Sources'] as const;
type EditorTab = (typeof EDITOR_TABS)[number];
const RIBBON = ['Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate', 'Help'] as const;
const COLS = ['METRIC', 'ACTUAL (N)', 'TARGET (N)', 'VARIANCE (N)', 'VARIANCE (%)', 'STATUS', 'COMMENTS'] as const;

function Ribbon({ active, onActive }: { active: string; onActive: (r: string) => void }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="flex gap-3 border-b border-line px-3 text-[11px]" role="tablist">
        {RIBBON.map((r) => (
          <button key={r} role="tab" aria-selected={r === active} type="button" onClick={() => onActive(r)} className={`-mb-px border-b-2 py-1.5 ${r === active ? 'border-blue-600 font-medium text-blue-700' : 'border-transparent text-muted'}`}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600">
        <span className="rounded border border-line px-2 py-0.5">Calibri <ChevronDown size={10} className="inline" aria-hidden="true" /></span>
        <span className="rounded border border-line px-2 py-0.5">11</span>
        <span className="flex gap-1.5 text-slate-700"><Bold size={13} aria-hidden="true" /><Italic size={13} aria-hidden="true" /><Underline size={13} aria-hidden="true" /></span>
        <span className="flex gap-1.5 text-slate-700"><AlignLeft size={13} aria-hidden="true" /><AlignCenter size={13} aria-hidden="true" /><AlignRight size={13} aria-hidden="true" /></span>
        <span className="rounded border border-line px-2 py-0.5">General <ChevronDown size={10} className="inline" aria-hidden="true" /></span>
        <span className="text-[10px] text-muted">Conditional Formatting</span>
        <span className="text-[10px] text-muted">Format as Table</span>
        <span className="text-[10px] text-muted">Cell Styles</span>
        <span className="text-[10px] text-muted">Insert / Delete / Format</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted"><Zap size={11} aria-hidden="true" /> Automate</span>
      </div>
    </div>
  );
}

function ExcelEditor() {
  const [ribbon, setRibbon] = useState<string>('Home');
  const [sheet, setSheet] = useState('Summary');
  const wb = useAsync(() => api.getWorkbook('Morning_Report.xlsx'), []);
  const w = wb.data;
  return (
    <div className="flex min-h-0 flex-col">
      <Ribbon active={ribbon} onActive={setRibbon} />
      <div className="flex items-center gap-2 border-b border-line bg-white px-3 py-1.5 text-[11px]">
        <span className="w-14 rounded border border-line px-2 py-0.5 text-center font-medium text-ink">{w?.activeCell ?? 'C7'}</span>
        <span className="italic text-muted">fx</span>
        <span className="flex-1 rounded border border-line px-2 py-0.5 text-ink">{w?.formula ?? '120,000,000'}</span>
        <span className="text-[10px] text-green-600">{w?.savedAgo ?? 'Workbook saved 2 mins ago'}</span>
        <span className="rounded border border-line px-2 py-0.5 text-[10px] text-slate-600">100%</span>
      </div>
      {wb.loading && !wb.data && <div className="p-4"><Loading rows={6} /></div>}
      {wb.error && <div className="p-4"><ErrorNote error={wb.error} /></div>}
      {w && (
        <div className="overflow-x-auto bg-white p-3">
          <p className="mb-2 text-[12px] font-bold tracking-wide text-ink">{w.title} <span className="font-normal text-muted">{w.date}</span></p>
          <table className="w-full min-w-[860px] border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="w-8 border border-line bg-slate-50 py-1 text-[10px] font-normal text-muted"> </th>
                {COLS.map((c) => (
                  <th key={c} className="border border-line bg-slate-50 px-2 py-1 text-left text-[10px] font-semibold text-slate-600">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {w.rows.map((r: WorkbookSheetRow, i: number) => (
                <tr key={r.metric}>
                  <td className="border border-line bg-slate-50 px-2 py-1 text-center text-[10px] text-muted">{i + 2}</td>
                  <td className="border border-line px-2 py-1 font-medium text-ink">{r.metric}</td>
                  <td className="border border-line px-2 py-1 text-right tabular-nums">{r.actual}</td>
                  <td className="border border-line px-2 py-1 text-right tabular-nums">{r.target}</td>
                  <td className={`border border-line px-2 py-1 text-right tabular-nums ${r.status === 'Unfavorable' ? 'text-red-600' : ''}`}>{r.varianceN}</td>
                  <td className={`border border-line px-2 py-1 text-right tabular-nums ${r.status === 'Unfavorable' ? 'text-red-600' : ''}`}>{r.variancePct}</td>
                  <td className="border border-line px-2 py-1"><StatusChip tone={r.status === 'Favorable' ? 'green' : 'red'}>{r.status}</StatusChip></td>
                  <td className="border border-line px-2 py-1 text-muted">{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-auto flex items-center gap-1 border-t border-line bg-slate-50 px-2 py-1 text-[11px]">
        {(w?.sheets ?? []).map((s) => (
          <button key={s} type="button" onClick={() => setSheet(s)} className={`rounded-t px-3 py-1 ${s === sheet ? 'bg-white font-medium text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}>{s}</button>
        ))}
        <Plus size={13} className="ml-1 text-muted" aria-hidden="true" />
      </div>
    </div>
  );
}

function DocumentView() {
  const doc = useAsync(() => api.getDocumentPreview('Q2_FINANCIALS.docx'), []);
  return (
    <Card title="Q2_FINANCIALS.docx" action={<span className="text-[10px] text-muted">{doc.data?.words ?? ''} words</span>} className="min-w-0">
      {doc.loading && <Loading rows={4} />}
      {doc.data && (
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-center text-[12px] font-bold text-ink">{doc.data.title}</p>
          <p className="text-center text-[10px] text-muted">{doc.data.subtitle}</p>
          {doc.data.sections.map((s) => (
            <div key={s.heading} className="mt-3">
              <p className="text-[11px] font-semibold text-ink">{s.heading}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PdfView() {
  const pdf = useAsync(() => api.getPdfPreview('BUDGET_ANALYSIS.pdf'), []);
  const p = pdf.data;
  return (
    <Card title="BUDGET_ANALYSIS.pdf" action={<span className="text-[10px] text-muted">Page {p?.page ?? 1} of {p?.pageCount ?? 1} · {p?.zoom ?? 100}%</span>} className="min-w-0">
      {pdf.loading && <Loading rows={4} />}
      {p && (
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-line bg-white p-3">
          <div className="min-w-0 text-[10px]">
            <p className="text-[12px] font-bold text-ink">{p.title}</p>
            <p className="text-muted">{p.date}</p>
            <p className="mt-2 text-slate-600">{p.overview}</p>
            <p className="mt-2 font-semibold text-ink">Total budget: {p.totalBudget}</p>
          </div>
          <div className="flex items-center gap-2">
            <DonutChart size={112} innerRadius={32} outerRadius={50} data={p.donut.map((d) => ({ label: d.label, value: d.value, tone: d.tone }))} />
            <ul className="space-y-1 text-[9px]">
              {p.donut.map((d) => (
                <li key={d.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: TONE_HEX[d.tone] }} /><span className="text-slate-600">{d.label}</span><span className="font-semibold">{d.percent}%</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

function AllFilesPanel() {
  const files = useAsync(() => api.listWorkspaceFiles(), []);
  const columns: Column<FileItem>[] = [
    { key: 'name', header: 'Name', render: (f) => <span className="flex items-center gap-2 font-medium"><FileKindIcon kind={f.kind} />{f.name}</span> },
    { key: 'ws', header: 'Workspace', render: (f) => f.workspace },
    { key: 'mod', header: 'Modified', render: (f) => <span className="text-muted">{f.lastModified}</span> },
    { key: 'status', header: 'Status', render: (f) => <StatusChip tone={f.status === 'Edited' ? 'green' : f.status === 'Analyzed' ? 'purple' : 'slate'}>{f.status}</StatusChip> },
  ];
  return (
    <Card title="All Files" action={<ViewAll label="Open all" />} bodyClassName="px-0 pb-2">
      {files.loading && !files.data && <div className="px-4"><Loading rows={4} /></div>}
      {files.error && <div className="px-4"><ErrorNote error={files.error} /></div>}
      {files.data && <DataTable columns={columns} rows={files.data} minWidth={460} caption="Workspace files" />}
    </Card>
  );
}

function FileTabs() {
  const meta = useAsync(() => api.getWorkspaceMeta(), []);
  const [active, setActive] = useState('Morning_Report.xlsx');
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-slate-50 px-3 pt-2">
      {(meta.data?.fileTabs ?? []).map((f) => (
        <button key={f.name} type="button" onClick={() => setActive(f.name)} className={`flex items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-1.5 text-[11px] ${f.name === active ? 'border-line bg-white font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
          <FileKindIcon kind={f.kind} />{f.name}
        </button>
      ))}
    </div>
  );
}

export default function WorkspacePage() {
  const [tab, setTab] = useState<EditorTab>('Excel Editor');
  const meta = useAsync(() => api.getWorkspaceMeta(), []);
  return (
    <SidebarLayout searchPlaceholder="Search files, sheets, formulas...">
      <div className="grid gap-3 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 items-center gap-2 rounded-md border border-line bg-white px-2.5 text-[11px] font-semibold text-ink shadow-card">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[9px] text-white">O</span>
                {meta.data?.name ?? 'Officeroom'}
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">{meta.data?.plan ?? 'Enterprise Plan'}</span>
                <ChevronDown size={11} aria-hidden="true" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button type="button" className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 shadow-card"><Save size={12} aria-hidden="true" /> Save</button>
              <button type="button" className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 shadow-card"><Share2 size={12} aria-hidden="true" /> Share</button>
              <button type="button" className="flex items-center gap-1 rounded-md bg-blue-700 px-2.5 py-1.5 font-medium text-white shadow-card"><Eye size={12} aria-hidden="true" /> Preview</button>
              <Grid3x3 size={14} className="text-muted" aria-hidden="true" />
              <Search size={14} className="text-muted" aria-hidden="true" />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
              <PillFilter items={EDITOR_TABS} value={tab} onChange={setTab} />
            </div>
            <FileTabs />
            {tab === 'Excel Editor' && <ExcelEditor />}
            {tab !== 'Excel Editor' && <div className="p-4 text-[11px] text-muted">{tab} view is available in the full build. Excel Editor is live.</div>}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <DocumentView />
            <PdfView />
          </div>
          <AllFilesPanel />
        </div>
        <AICopilotPanel className="xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)]" />
      </div>
    </SidebarLayout>
  );
}
