import { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Database, Download, ChevronDown, Activity, ShieldAlert } from 'lucide-react';
import { api } from '../api';
import type { FileItem, FileKind, DataSource } from '../api/types';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/ui/StatCard';
import { Sparkline } from '../components/ui/Sparkline';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Card, PillFilter, Loading, ErrorNote, StatusChip, FileKindIcon, ViewAll, ProgressBar, Avatar } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { TONE_HEX } from '../lib/tones';
import type { Tone } from '../api/types';

const TABS = ['All', 'Excel', 'CSV', 'PDF', 'Word', 'More'] as const;
type DcTab = (typeof TABS)[number];

const TAG_TONE: Record<string, { cls: string; tone: Tone }> = {
  Finance: { cls: 'bg-blue-50 text-blue-700 ring-blue-200', tone: 'blue' },
  HR: { cls: 'bg-violet-50 text-violet-700 ring-violet-200', tone: 'purple' },
  Reports: { cls: 'bg-orange-50 text-orange-700 ring-orange-200', tone: 'orange' },
  Sales: { cls: 'bg-green-50 text-green-700 ring-green-200', tone: 'green' },
  Operations: { cls: 'bg-teal-50 text-teal-700 ring-teal-200', tone: 'teal' },
  Compliance: { cls: 'bg-red-50 text-red-700 ring-red-200', tone: 'red' },
  Marketing: { cls: 'bg-amber-50 text-amber-700 ring-amber-200', tone: 'amber' },
};

function tagChip(tag: string | undefined) {
  if (!tag) return null;
  const t = TAG_TONE[tag] ?? { cls: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${t.cls}`}>{tag}</span>;
}

function DcFiles() {
  const [tab, setTab] = useState<DcTab>('All');
  const [search, setSearch] = useState('');
  const kind = tab === 'Word' ? 'Word' : tab === 'Excel' ? 'Excel' : tab === 'CSV' ? 'CSV' : tab === 'PDF' ? 'PDF' : tab === 'More' ? 'More' : 'All';
  const files = useAsync(() => api.listDataFiles(kind as FileKind | 'All' | 'More'), [tab]);
  const rows = (files.data ?? []).filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<FileItem>[] = [
    { key: 'name', header: 'Name', render: (f) => <span className="flex items-center gap-2 font-medium"><FileKindIcon kind={f.kind} />{f.name}</span> },
    { key: 'ds', header: 'Dataset / Source', render: (f) => f.datasetOrSource ?? '' },
    { key: 'owner', header: 'Owner', render: (f) => <span className="flex items-center gap-1.5"><Avatar initials={(f.owner ?? '??').split(' ').map((p) => p[0]).join('').slice(0, 2)} size={18} />{f.owner}</span> },
    { key: 'mod', header: 'Last Modified', render: (f) => <span className="text-muted">{f.lastModified}</span> },
    { key: 'size', header: 'Size', render: (f) => f.size ?? '' },
    { key: 'tag', header: 'Tag', render: (f) => tagChip(f.tag) },
  ];
  return (
    <Card title="Recent Files" action={<ViewAll label="Browse all" />} bodyClassName="px-0 pb-3" className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <PillFilter items={TABS} value={tab} onChange={setTab} />
        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." aria-label="Search files" className="h-9 w-full sm:h-7 sm:w-44 rounded-md border border-line bg-white pl-7 pr-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300" />
          </label>
          <button type="button" className="flex h-7 items-center gap-1 rounded-md border border-line bg-white px-2 text-[11px] text-slate-600"><SlidersHorizontal size={12} aria-hidden="true" /> Filters <ChevronDown size={10} aria-hidden="true" /></button>
        </div>
      </div>
      {files.loading && !files.data && <div className="px-4"><Loading rows={5} /></div>}
      {files.error && <div className="px-4"><ErrorNote error={files.error} /></div>}
      {files.data && <DataTable columns={columns} rows={rows} minWidth={760} caption="Recent data files" />}
    </Card>
  );
}

function DataSourcesCard() {
  const src = useAsync(() => api.listDataSources(), []);
  return (
    <Card title="Data Sources" action={<ViewAll />}>
      {src.loading && <Loading rows={5} />}
      {src.error && <ErrorNote error={src.error} />}
      <ul className="space-y-2.5">
        {src.data?.map((s: DataSource) => (
          <li key={s.id} className="flex items-center gap-2.5 text-[11px]">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600"><Database size={13} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{s.name}</p>
              <p className="text-[10px] text-muted">{s.kind}</p>
            </div>
            <StatusChip tone={s.status === 'Healthy' ? 'green' : 'amber'}>{s.status}</StatusChip>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function InsightsCard() {
  const ins = useAsync(() => api.getDataInsights(), []);
  const d = ins.data;
  return (
    <Card title="Data Insights" action={<ViewAll />}>
      {ins.loading && <Loading rows={4} />}
      {d && (
        <div className="space-y-3 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-muted">Top Data Growth</p>
              <p className="font-semibold text-ink">{d.topGrowth.label} <span className="text-green-600">{d.topGrowth.value}</span></p>
            </div>
            <div className="flex h-9 items-end gap-0.5">
              {d.topGrowth.bars.map((b, i) => (<span key={i} className="w-1.5 rounded-sm bg-blue-500/80" style={{ height: `${b}%` }} />))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-muted">Most Active Dataset</p>
              <p className="font-semibold text-ink">{d.mostActive.name} <span className="text-muted">{d.mostActive.updates} updates</span></p>
            </div>
            <Sparkline data={d.mostActive.sparkline} tone="indigo" width={64} height={26} />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef0f4" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={TONE_HEX.green} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${d.quality.score * 0.974} 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink">{d.quality.score}%</span>
            </div>
            <div>
              <p className="text-muted">Data Quality Score</p>
              <p className="font-semibold text-green-600">{d.quality.label}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-muted">Duplicate Records</p>
              <p className="font-semibold text-ink">{d.duplicates.count.toLocaleString('en-US')}</p>
              <p className="text-[10px] text-muted">{d.duplicates.note}</p>
            </div>
            <Sparkline data={d.duplicates.sparkline} tone="orange" width={64} height={26} />
          </div>
        </div>
      )}
    </Card>
  );
}

function AlertsCard() {
  const alerts = useAsync(() => api.listQualityAlerts(), []);
  return (
    <Card title="Recent Data Quality Alerts" action={<ViewAll />}>
      {alerts.loading && <Loading rows={3} />}
      <ul className="space-y-2.5">
        {alerts.data?.map((a) => (
          <li key={a.id} className="flex items-start gap-2 text-[11px]">
            <ShieldAlert size={13} className={`mt-0.5 shrink-0 ${a.severity === 'critical' ? 'text-red-600' : 'text-amber-500'}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{a.message}</p>
              <p className="text-[10px] text-muted">{a.dataset} · {a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CatalogSection() {
  const cat = useAsync(() => api.listCatalog(), []);
  return (
    <section className="mt-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-ink">Data Catalog</h2>
        <ViewAll label="Open catalog" />
      </div>
      {cat.loading && <Loading rows={3} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cat.data?.map((c) => (
          <Card key={c.id} title={c.name} action={<Avatar initials={c.owner.split(' ').map((p) => p[0]).join('').slice(0, 2)} tone={c.tone} size={22} />}>
            <p className="text-[10px] leading-relaxed text-muted">{c.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
              <div><p className="text-muted">Owner</p><p className="font-medium text-ink">{c.owner}</p></div>
              <div><p className="text-muted">Tables</p><p className="font-medium text-ink">{c.tables}</p></div>
              <div><p className="text-muted">Records</p><p className="font-medium text-ink">{c.records}</p></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
              <span>Updated {c.updated}</span>
              <span>{c.avatars} collaborators</span>
            </div>
            <div className="mt-2"><ProgressBar value={Math.min(100, c.tables * 3)} tone={c.tone} /></div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function DataCenterPage() {
  const stats = useAsync(() => api.getDataStats(), []);
  const storage = useAsync(() => api.getStorage(), []);
  const sidebar = useAsync(() => api.getDataSidebar(), []);
  return (
    <SidebarLayout
      searchPlaceholder="Search datasets, tables, sources..."
      sidebar={
        <Sidebar
          sections={sidebar.data ?? []}
          footer={
            <div className="rounded-lg border border-line bg-white p-2.5 shadow-card">
              <p className="text-[10px] font-semibold text-ink">Storage</p>
              <p className="text-[10px] text-muted">{storage.data ? `${storage.data.percent}% of ${storage.data.totalTb} TB used` : ''}</p>
              <div className="mt-1.5"><ProgressBar value={storage.data?.percent ?? 0} tone="blue" /></div>
              <button type="button" className="mt-2 text-[10px] font-medium text-blue-600">Manage Storage</button>
            </div>
          }
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted">Data / <span className="text-ink">Center</span></p>
          <h1 className="text-xl font-semibold text-ink">Data Center</h1>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button type="button" className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-slate-700 shadow-card"><Activity size={13} aria-hidden="true" /> Data Catalog</button>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 font-medium text-white shadow-card hover:bg-blue-800"><Plus size={13} aria-hidden="true" /> Add Data</button>
          <button type="button" aria-label="Download" className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-slate-600"><Download size={13} /></button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2 xl:grid-cols-5 xl:[&>*:last-child:nth-child(odd)]:col-span-1">
        {stats.loading && !stats.data && <Loading rows={2} />}
        {stats.data?.map((s) => (
          <StatCard key={s.id} label={s.label} value={s.value} change={s.change} changeNote={s.changeNote} icon={s.icon} tone={s.tone} sparkline={s.sparkline} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_300px]">
        <DcFiles />
        <div className="flex flex-col gap-3">
          <DataSourcesCard />
          <InsightsCard />
          <AlertsCard />
        </div>
      </div>

      <CatalogSection />
    </SidebarLayout>
  );
}
