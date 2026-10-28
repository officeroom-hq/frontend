import { useState } from 'react';
import { CalendarDays, ChevronDown, MoreVertical, SlidersHorizontal } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api';
import type { FileKind } from '../../api/types';
import { AppLayout } from '../../layouts/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { AICopilotPanel } from '../../components/AICopilotPanel';
import { AIActionsCard } from '../../components/AIActionsCard';
import { DonutChart } from '../../components/ui/DonutChart';
import { Card, ViewAll, PillFilter, Loading, ErrorNote, StatusChip, FileKindIcon, ProgressBar, Avatar, fileStatusTone, Skeleton } from '../../components/ui';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { useAsync } from '../../hooks/useAsync';
import { TONE_HEX } from '../../lib/tones';
import type { FileItem, WorkspaceSummary, ActivityItem } from '../../api/types';

const FILE_TABS = ['All', 'Excel', 'Documents', 'PDF', 'More'] as const;
type FileTab = (typeof FILE_TABS)[number];

function tabToKind(tab: FileTab): FileKind | 'All' | 'More' {
  if (tab === 'Excel') return 'Excel';
  if (tab === 'Documents') return 'Document';
  if (tab === 'PDF') return 'PDF';
  if (tab === 'More') return 'More';
  return 'All';
}

function RecentWork() {
  const [tab, setTab] = useState<FileTab>('All');
  const files = useAsync(() => api.listRecentFiles(tabToKind(tab)), [tab]);
  const columns: Column<FileItem>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (f) => (
        <span className="flex items-center gap-2 font-medium">
          <FileKindIcon kind={f.kind} />
          {f.name}
        </span>
      ),
    },
    { key: 'type', header: 'Type', render: (f) => <span className="text-muted">{f.kind === 'Document' ? 'Document' : f.kind}</span> },
    { key: 'ws', header: 'Workspace', render: (f) => f.workspace },
    { key: 'mod', header: 'Last Modified', render: (f) => <span className="text-muted">{f.lastModified}</span> },
    { key: 'status', header: 'Status', render: (f) => <StatusChip tone={fileStatusTone(f.status)}>{f.status}</StatusChip> },
  ];
  return (
    <Card
      title="Recent Work"
      action={<ViewAll label="View all files" />}
      bodyClassName="px-0 pb-3"
      className="flex flex-col"
    >
      <div className="px-4 pb-2.5">
        <PillFilter items={FILE_TABS} value={tab} onChange={setTab} />
      </div>
      {files.loading && !files.data ? <div className="px-4"><Loading rows={5} /></div> : null}
      {files.error && <div className="px-4"><ErrorNote error={files.error} /></div>}
      {files.data && <DataTable columns={columns} rows={files.data} minWidth={520} caption="Recent work files" />}
    </Card>
  );
}

const CHART_SERIES = [
  { key: 'tasks', name: 'Tasks Executed', color: TONE_HEX.blue },
  { key: 'files', name: 'Files Analyzed', color: TONE_HEX.green },
  { key: 'ai', name: 'AI Executions', color: TONE_HEX.purple },
] as const;

function WorkOverview() {
  const [range, setRange] = useState('This Week');
  const overview = useAsync(() => api.getWorkOverview(range), [range]);
  const totals = overview.data?.totals;
  return (
    <Card
      title="Work Overview"
      action={
        <select
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-md border border-line bg-white px-2 py-1 text-[11px] text-slate-600"
        >
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      }
      className="flex flex-col"
    >
      <div className="mb-1 flex flex-wrap gap-3 text-[10px] text-slate-600">
        {CHART_SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="h-44 w-full">
        {overview.loading && !overview.data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.data?.points ?? []} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#eef0f4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}K` : String(v))} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ display: 'none' }} />
              {CHART_SERIES.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: s.color }} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {totals && (
        <div className="mt-3 grid grid-cols-4 divide-x divide-line rounded-lg border border-line">
          {[
            { label: 'Tasks Executed', value: totals.tasks, color: 'text-blue-600' },
            { label: 'Files Analyzed', value: totals.files, color: 'text-green-600' },
            { label: 'AI Executions', value: totals.ai, color: 'text-violet-600' },
            { label: 'Reports Generated', value: totals.reports, color: 'text-orange-500' },
          ].map((t) => (
            <div key={t.label} className="px-2 py-2 text-center">
              <p className="text-[9px] text-muted">{t.label}</p>
              <p className={`text-xs font-semibold ${t.color}`}>{t.value.toLocaleString('en-US')}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function WorkspacesCard() {
  const ws = useAsync(() => api.listWorkspaces(), []);
  const WS_COLOR: Record<string, string> = { blue: 'text-blue-600 bg-blue-50', green: 'text-green-600 bg-green-50', purple: 'text-violet-600 bg-violet-50', orange: 'text-orange-500 bg-orange-50' };
  return (
    <Card title="Workspaces" action={<ViewAll label="View all" />}>
      {ws.loading && <Loading rows={2} />}
      {ws.error && <ErrorNote error={ws.error} />}
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {ws.data?.map((w: WorkspaceSummary) => (
          <div key={w.id} className="rounded-lg border border-line p-2.5">
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] ${WS_COLOR[w.tone] ?? WS_COLOR.blue}`}>▣</span>
              <p className="text-[11px] font-semibold text-ink">{w.name}</p>
            </div>
            <p className="mt-2 text-[10px] text-muted">{w.members} Members</p>
            <p className="text-[10px] text-muted">{w.activeWorkflows} Active Workflows</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar value={w.activity} tone={w.tone} />
              </div>
              <span className="text-[10px] font-medium text-ink">{w.activity}%</span>
            </div>
            <p className="text-[9px] text-muted">activity</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TaskStatusCard() {
  const status = useAsync(() => api.getTaskStatus(), []);
  return (
    <Card title="Task Status" action={<ViewAll />}>
      {status.loading && <Loading rows={3} />}
      {status.data && (
        <div className="flex items-center gap-5">
          <DonutChart
            size={124}
            data={status.data.slices.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))}
            centerTop={status.data.total.toLocaleString('en-US')}
            centerBottom="Total Tasks"
          />
          <ul className="flex-1 space-y-1.5 text-[11px]">
            {status.data.slices.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: TONE_HEX[s.tone] }} />
                <span className="flex-1 text-slate-600">{s.label}</span>
                <span className="font-semibold text-ink">{s.value.toLocaleString('en-US')}</span>
                <span className="w-9 text-right text-muted">{s.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function RecentActivityCard() {
  const acts = useAsync(() => api.listActivities(), []);
  return (
    <Card title="Recent Activity" action={<ViewAll />}>
      {acts.loading && <Loading rows={2} />}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {acts.data?.map((a: ActivityItem) => (
          <li key={a.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
              {a.kind === 'AI' ? <span className="text-[10px] text-violet-600">✦</span> : <FileKindIcon kind={a.kind === 'Upload' ? 'Document' : a.kind} />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-ink">{a.text}</p>
              <p className="truncate text-[10px] text-muted">{a.subtext}</p>
              <p className="text-[9px] text-muted">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAsync(() => api.getCurrentUser(), []);
  const stats = useAsync(() => api.getDashboardStats(), []);
  return (
    <AppLayout>
      <main className="flex-1 px-4 pb-6 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted">Dashboard / <span className="text-ink">{user.data?.greeting ?? 'Good morning, John!'}</span></p>
            <h1 className="mt-0.5 text-xl font-semibold text-ink">Dashboard</h1>
            <p className="text-[11px] text-muted">Here's what's happening across your organization.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] text-slate-700 shadow-card">
              <CalendarDays size={13} aria-hidden="true" />
              May 24 - May 30, 2025
              <ChevronDown size={12} aria-hidden="true" />
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] text-slate-700 shadow-card">
              <SlidersHorizontal size={13} aria-hidden="true" /> Filter
            </button>
            <button type="button" aria-label="More options" className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-slate-600 shadow-card">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
          {stats.loading && !stats.data && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[72px]" />)}
          {stats.data?.map((s) => (
            <StatCard key={s.id} label={s.label} value={s.value} change={s.change} changeNote={s.changeNote} icon={s.icon} tone={s.tone} sparkline={s.sparkline} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1.1fr]">
          <RecentWork />
          <WorkOverview />
          <div className="flex flex-col gap-3">
            <AICopilotPanel className="min-h-[430px]" />
            <AIActionsCard />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1.1fr]">
          <div className="xl:col-span-2">
            <WorkspacesCard />
          </div>
          <TaskStatusCard />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1.1fr]">
          <RecentActivityCard />
        </div>
        <p className="sr-only">{user.data?.name}</p>
        <div className="sr-only">{stats.error && <Avatar initials="" />}</div>
      </main>
    </AppLayout>
  );
}
