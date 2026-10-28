import { useEffect, useState } from 'react';
import { api, type AuditCategory, type AuditQuery } from '../../api';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { AppSidebar, type AppSidebarLink } from '../../components/AppSidebar';
import { AccessDenied, Card, DataTable, EmptyState, ErrorState, LoadingState, PageHeader, SearchInput, Select, StatusChip, type Column } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useSession } from '../../lib/session';
import { Shield } from 'lucide-react';
import type { AuditEvent } from '../../api';

const CATEGORIES: { value: AuditCategory | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'auth', label: 'Sign-in' },
  { value: 'file', label: 'Files' },
  { value: 'member', label: 'Members' },
  { value: 'department', label: 'Departments' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'ai', label: 'AI actions' },
];
const AUDIT_LINKS: AppSidebarLink[] = [
  { label: 'Departments', to: '/admin', capability: 'departments:view', icon: <Shield size={13} aria-hidden="true" /> },
  { label: 'Audit log', to: '/audit', capability: 'audit:view', icon: <Shield size={13} aria-hidden="true" /> },
];

export function AuditPage() {
  const { can } = useSession();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AuditCategory | ''>('');
  const [outcome, setOutcome] = useState<'success' | 'failed' | ''>('');
  const [sinceDays, setSinceDays] = useState(30);
  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const query: AuditQuery = { search: debounced, category, outcome, sinceDays };
  const events = useAsync(() => api.listAuditEvents(query), [debounced, category, outcome, sinceDays]);

  if (!can('audit:view')) return <SidebarLayout><AccessDenied /></SidebarLayout>;

  const cols: Column<AuditEvent>[] = [
    { key: 'time', header: 'When', render: (e) => <span className="whitespace-nowrap text-muted">{e.timestamp}</span> },
    { key: 'actor', header: 'Who', render: (e) => <span><span className="block font-medium text-ink">{e.actor}</span><span className="block text-micro text-muted">{e.actorRole}</span></span> },
    { key: 'action', header: 'Action', render: (e) => e.action },
    { key: 'target', header: 'Target', render: (e) => e.target },
    { key: 'ip', header: 'IP', render: (e) => <span className="font-mono text-muted">{e.ip}</span> },
    { key: 'outcome', header: 'Outcome', render: (e) => <StatusChip tone={e.outcome === 'success' ? 'green' : 'red'}>{e.outcome === 'success' ? 'Success' : 'Failed'}</StatusChip> },
  ];

  return (
    <SidebarLayout sidebar={<AppSidebar links={AUDIT_LINKS} title="Admin" />} searchPlaceholder="Search audit events">
      <PageHeader title="Audit log" subtitle="Every sign-in, file change, member change and AI action, with who did it and when." />

      <Card title="Events" bodyClassName="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <SearchInput label="Search events" placeholder="Search actor, action or target" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as AuditCategory | '')} className="!w-auto">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Select label="Outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as 'success' | 'failed' | '')} className="!w-auto">
            <option value="">Any outcome</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </Select>
          <Select label="Period" value={String(sinceDays)} onChange={(e) => setSinceDays(Number(e.target.value))} className="!w-auto">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </div>

        {events.loading ? <LoadingState rows={6} label="Loading audit events" />
          : events.error ? <ErrorState error={events.error} onRetry={events.reload} />
          : (events.data ?? []).length === 0 ? <EmptyState title="No events match these filters" body="Widen the period or clear the search." />
          : <DataTable columns={cols} rows={events.data ?? []} caption="Audit events" minWidth={760} />}
      </Card>
    </SidebarLayout>
  );
}
