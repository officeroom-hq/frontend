import { useState } from 'react';
import { ChevronDown, Download, Filter, Network, Plus, Search, MoreHorizontal, SlidersHorizontal, CalendarDays, Cake } from 'lucide-react';
import { api } from '../api';
import type { Employee, EmployeeQuery, EmployeeStatus, EmployeeTab } from '../api/types';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, type Column } from '../components/ui/DataTable';
import { DonutChart } from '../components/ui/DonutChart';
import { Card, ViewAll, PillFilter, Loading, ErrorNote, StatusChip, Avatar, ProgressBar, AvatarStack } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { TONE_HEX } from '../lib/tones';

const TABS: readonly EmployeeTab[] = ['Employee Directory', 'New Hires', 'Onboarding', 'Exits'];
const DEPARTMENTS = ['All Departments', 'Finance', 'HR', 'Operations', 'Sales', 'IT'] as const;
const LOCATIONS = ['All Locations', 'Lagos', 'Abuja', 'Port Harcourt', 'Remote'] as const;
const STATUSES = ['All Status', 'Active', 'On Leave'] as const;
const PAGE_SIZE = 8;

function Directory() {
  const [tab, setTab] = useState<EmployeeTab>('Employee Directory');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>('All Departments');
  const [location, setLocation] = useState<string>('All Locations');
  const [status, setStatus] = useState<string>('All Status');
  const [page, setPage] = useState(1);
  const query: EmployeeQuery = {
    tab,
    search,
    department: department === 'All Departments' ? '' : department,
    location: location === 'All Locations' ? '' : location,
    status: status === 'All Status' ? '' : (status as EmployeeStatus),
    page,
    pageSize: PAGE_SIZE,
  };
  const list = useAsync(() => api.listEmployees(query), [tab, search, department, location, status, page]);
  const columns: Column<Employee>[] = [
    {
      key: 'check',
      header: <input type="checkbox" aria-label="Select all" className="h-3 w-3 accent-blue-600" />,
      render: () => <input type="checkbox" aria-label="Select row" className="h-3 w-3 accent-blue-600" />,
      className: 'w-6',
    },
    {
      key: 'name',
      header: 'Name',
      render: (e) => (
        <span className="flex items-center gap-2">
          <Avatar initials={e.initials} tone={e.tone} size={24} />
          <span className="font-medium">{e.name}</span>
        </span>
      ),
    },
    { key: 'role', header: 'Role', render: (e) => e.role },
    { key: 'dept', header: 'Department', render: (e) => e.department },
    { key: 'loc', header: 'Location', render: (e) => e.location },
    { key: 'status', header: 'Status', render: (e) => <StatusChip tone={e.status === 'Active' ? 'green' : 'amber'}>{e.status}</StatusChip> },
    { key: 'tenure', header: 'Tenure', render: (e) => e.tenure },
    { key: 'email', header: 'Email', render: (e) => <span className="text-muted">{e.email}</span> },
    { key: 'actions', header: '', render: () => <MoreHorizontal size={14} className="text-muted" aria-label="Row actions" />, className: 'w-6' },
  ];
  const pageData = list.data;
  const from = pageData && pageData.total > 0 ? (pageData.page - 1) * pageData.pageSize + 1 : 0;
  const to = pageData ? Math.min(pageData.page * pageData.pageSize, pageData.total) : 0;
  return (
    <Card className="flex flex-col" bodyClassName="px-0 pb-3" title="Employee Directory" action={<ViewAll label="Export" />}>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <PillFilter items={TABS} value={tab} onChange={(t) => { setTab(t); setPage(1); }} />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search people..."
              aria-label="Search people"
              className="h-7 w-44 rounded-md border border-line bg-white pl-7 pr-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </label>
          {[{ v: department, o: DEPARTMENTS, set: setDepartment }, { v: location, o: LOCATIONS, set: setLocation }, { v: status, o: STATUSES, set: setStatus }].map((f, i) => (
            <select key={i} value={f.v} onChange={(e) => { f.set(e.target.value); setPage(1); }} aria-label={['Department', 'Location', 'Status'][i]} className="h-7 rounded-md border border-line bg-white px-2 text-[11px] text-slate-600">
              {f.o.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          <button type="button" className="flex h-7 items-center gap-1 rounded-md border border-line bg-white px-2 text-[11px] text-slate-600">
            <SlidersHorizontal size={12} aria-hidden="true" /> More Filters
          </button>
        </div>
      </div>
      {list.loading && !list.data && <div className="px-4"><Loading rows={6} /></div>}
      {list.error && <div className="px-4"><ErrorNote error={list.error} /></div>}
      {pageData && <DataTable columns={columns} rows={pageData.items} minWidth={820} caption="Employees" />}
      {pageData && (
        <div className="flex items-center justify-between px-4 pt-3 text-[11px] text-muted">
          <span>Showing {from} to {to} of {pageData.total.toLocaleString('en-US')}</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Prev</button>
            <span className="px-2 font-medium text-ink">{page} / {pageData.totalPages}</span>
            <button type="button" disabled={page >= pageData.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Analytics() {
  const a = useAsync(() => api.getPeopleAnalytics(), []);
  return (
    <Card title="People Analytics" action={<ViewAll label="Details" />}>
      {a.loading && <Loading rows={4} />}
      {a.data && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-medium text-ink">Gender Distribution</p>
            <div className="flex items-center gap-4">
              <DonutChart size={104} innerRadius={32} outerRadius={48} data={a.data.gender.map((g) => ({ label: g.label, value: g.value, tone: g.tone }))} />
              <ul className="space-y-1.5 text-[10px]">
                {a.data.gender.map((g) => (
                  <li key={g.label} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: TONE_HEX[g.tone] }} />
                    <span className="text-slate-600">{g.label}</span>
                    <span className="font-semibold text-ink">{g.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium text-ink">Department Distribution</p>
            <ul className="space-y-2">
              {a.data.departments.map((d) => (
                <li key={d.label} className="grid grid-cols-[78px_1fr_30px] items-center gap-2 text-[10px]">
                  <span className="text-slate-600">{d.label}</span>
                  <ProgressBar value={d.percent} tone={d.tone} />
                  <span className="text-right font-medium text-ink">{d.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

function ActivityAndTimeOff() {
  const acts = useAsync(() => api.listPeopleActivities(), []);
  const timeOff = useAsync(() => api.listTimeOff(), []);
  const bdays = useAsync(() => api.listUpcomingBirthdays(), []);
  return (
    <>
      <Card title="Recent Activities" action={<ViewAll />}>
        {acts.loading && <Loading rows={3} />}
        <ul className="space-y-2.5">
          {acts.data?.map((a) => (
            <li key={a.id} className="text-[10px]">
              <p className="text-ink">{a.text}</p>
              <p className="text-muted">{a.subtext} · {a.time}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Upcoming Time Off" action={<ViewAll />}>
        {timeOff.loading && <Loading rows={2} />}
        <ul className="space-y-2.5">
          {timeOff.data?.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <Avatar initials={t.initials} tone={t.tone} size={24} />
              <div className="min-w-0 flex-1 text-[10px]">
                <p className="truncate font-medium text-ink">{t.name}</p>
                <p className="text-muted">{t.type} · {t.range}</p>
              </div>
              <span className="text-[10px] font-medium text-blue-700">{t.days}d</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Upcoming Birthdays">
        <ul className="space-y-2">
          {bdays.data?.map((b) => (
            <li key={b.id} className="flex items-center gap-2 text-[10px]">
              <Avatar initials={b.initials} tone={b.tone} size={22} />
              <span className="flex-1 truncate text-ink">{b.name}</span>
              <span className="flex items-center gap-1 text-muted"><Cake size={10} aria-hidden="true" />{b.date}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function TeamOverview() {
  const teams = useAsync(() => api.listTeams(), []);
  return (
    <section className="mt-3">
      <h2 className="mb-2 text-[13px] font-semibold text-ink">Team Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {teams.loading && <Loading rows={2} />}
        {teams.data?.map((t) => (
          <Card key={t.id} title={t.name} action={<ViewAll label="View Team" />}>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><p className="text-muted">Members</p><p className="text-sm font-semibold text-ink">{t.members}</p></div>
              <div><p className="text-muted">Open Positions</p><p className="text-sm font-semibold text-ink">{t.openPositions}</p></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <AvatarStack initials={t.avatarInitials} extra={t.extraAvatars} />
              <span className="text-[10px] text-muted">{t.activity}% activity</span>
            </div>
            <div className="mt-2"><ProgressBar value={t.activity} tone={t.tone} /></div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function PeoplePage() {
  const stats = useAsync(() => api.getPeopleStats(), []);
  const sidebar = useAsync(() => api.getPeopleSidebar(), []);
  return (
    <SidebarLayout
      searchPlaceholder="Search people, teams, roles..."
      sidebar={
        <Sidebar
          sections={sidebar.data ?? []}
          footer={
            <div className="rounded-lg border border-line bg-blue-50/50 p-2.5 text-[10px] text-slate-600">
              <p className="flex items-center gap-1 font-medium text-ink"><CalendarDays size={11} aria-hidden="true" /> Upcoming Birthdays</p>
              <p className="mt-1">Check the Birthdays list in the right column.</p>
            </div>
          }
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted">People / <span className="text-ink">Overview</span></p>
          <h1 className="text-xl font-semibold text-ink">People Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] text-slate-700 shadow-card"><Network size={13} aria-hidden="true" /> Org Chart</button>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-[11px] font-medium text-white shadow-card hover:bg-blue-800"><Plus size={13} aria-hidden="true" /> Add People</button>
          <button type="button" className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] text-slate-700 shadow-card"><Download size={12} aria-hidden="true" /> Export <ChevronDown size={11} aria-hidden="true" /></button>
          <button type="button" aria-label="Filter" className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-slate-600"><Filter size={13} /></button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {stats.loading && !stats.data && <Loading rows={2} />}
        {stats.data?.map((s) => (
          <StatCard key={s.id} label={s.label} value={s.value} change={s.change} changeNote={s.changeNote} icon={s.icon} tone={s.tone} sparkline={s.sparkline} invertGood={s.id === 'open'} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0"><Directory /></div>
        <div className="flex flex-col gap-3">
          <Analytics />
          <ActivityAndTimeOff />
        </div>
      </div>

      <TeamOverview />
    </SidebarLayout>
  );
}
