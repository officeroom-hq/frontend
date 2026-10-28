import { useMemo, useState, type FormEvent } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import { api, type Department, type InviteInput, type Member, type Role } from '../../api';
import { ROLES } from '../../lib/permissions';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { AppSidebar, type AppSidebarLink } from '../../components/AppSidebar';
import { AccessDenied, Avatar, Button, Card, DataTable, EmptyState, ErrorState, FormAlert, Input, LoadingState, Modal, PageHeader, Select, StatusChip, Tabs, type Column, type ChipTone } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useSession } from '../../lib/session';
import { isEmail, requiredText } from '../../lib/validation';

type Tab = 'departments' | 'members' | 'permissions';
const TABS: { value: Tab; label: string }[] = [
  { value: 'departments', label: 'Departments' },
  { value: 'members', label: 'Members' },
  { value: 'permissions', label: 'Roles and permissions' },
];
const ADMIN_LINKS: AppSidebarLink[] = [
  { label: 'Departments', to: '/admin', capability: 'departments:view', icon: <UserPlus size={13} aria-hidden="true" /> },
  { label: 'Audit log', to: '/audit', capability: 'audit:view', icon: <Mail size={13} aria-hidden="true" /> },
];

const STATUS_TONE: Record<Member['status'], ChipTone> = { Active: 'green', Invited: 'amber', Suspended: 'red' as ChipTone };

function InviteDialog({ open, departments, onClose, onInvited }: { open: boolean; departments: Department[]; onClose: () => void; onInvited: (m: Member) => void }) {
  const [form, setForm] = useState<InviteInput>({ fullName: '', email: '', role: 'Member', departmentId: departments[0]?.id ?? '' });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteInput, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof InviteInput>(k: K) => (v: InviteInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const n = requiredText(form.fullName, 'Full name');
    if (n) next.fullName = n;
    if (!isEmail(form.email)) next.email = 'Enter a valid work email.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      const m = await api.inviteMember(form);
      onInvited(m);
      setForm({ fullName: '', email: '', role: 'Member', departmentId: departments[0]?.id ?? '' });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send the invite.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Invite a member"
      description="They get an email to join Adeola Spices & Foods Ltd."
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="invite-form" loading={busy}>Send invite</Button></>}
    >
      <form id="invite-form" onSubmit={submit} noValidate className="space-y-3">
        {formError && <FormAlert>{formError}</FormAlert>}
        <Input label="Full name" value={form.fullName} onChange={(e) => set('fullName')(e.target.value)} error={errors.fullName} />
        <Input label="Work email" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} placeholder="name@adeolaspices.ng" />
        <Select label="Role" value={form.role} onChange={(e) => set('role')(e.target.value as Role)} hint="Owner can be given only by an Owner.">
          {ROLES.filter((r) => r !== 'Owner').map((r) => <option key={r}>{r}</option>)}
        </Select>
        <Select label="Department" value={form.departmentId} onChange={(e) => set('departmentId')(e.target.value)}>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </form>
    </Modal>
  );
}

export function DepartmentsPage() {
  const { can } = useSession();
  const [tab, setTab] = useState<Tab>('departments');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('');
  const departments = useAsync(() => api.listDepartments(), []);
  const members = useAsync(() => api.listMembers(), []);
  const matrix = useAsync(() => api.getPermissionMatrix(), []);
  const [added, setAdded] = useState<Member[]>([]);

  const allMembers = useMemo(() => [...added, ...(members.data ?? [])], [added, members.data]);
  const shown = useMemo(() => allMembers.filter((m) => !deptFilter || m.departmentId === deptFilter), [allMembers, deptFilter]);

  if (!can('departments:view')) return <SidebarLayout><AccessDenied /></SidebarLayout>;

  const memberCols: Column<Member>[] = [
    { key: 'name', header: 'Member', render: (m) => <span className="flex items-center gap-2"><Avatar initials={m.initials} tone={m.tone} size={22} /><span><span className="block font-medium text-ink">{m.fullName}</span><span className="block text-micro text-muted">{m.email}</span></span></span> },
    { key: 'dept', header: 'Department', render: (m) => m.departmentName },
    { key: 'role', header: 'Role', render: (m) => m.role },
    { key: 'status', header: 'Status', render: (m) => <StatusChip tone={STATUS_TONE[m.status]}>{m.status}</StatusChip> },
    { key: 'active', header: 'Last active', render: (m) => <span className="text-muted">{m.lastActive}</span> },
  ];

  const deptCols: Column<Department>[] = [
    { key: 'name', header: 'Department', render: (d) => <span className="flex items-center gap-2"><Avatar initials={d.name.slice(0, 2).toUpperCase()} tone={d.tone} size={22} /><span className="font-medium">{d.name}</span></span> },
    { key: 'head', header: 'Head', render: (d) => d.head },
    { key: 'desc', header: 'About', render: (d) => <span className="text-muted">{d.description}</span> },
    { key: 'members', header: 'Members', render: (d) => d.memberCount },
    { key: 'workflows', header: 'Active workflows', render: (d) => d.activeWorkflows },
  ];

  const deptSelect = (
    <Select label="Filter by department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="!w-auto">
      <option value="">All departments</option>
      {(departments.data ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </Select>
  );

  return (
    <SidebarLayout sidebar={<AppSidebar links={ADMIN_LINKS} title="Admin" />} searchPlaceholder="Search people and departments">
      <PageHeader
        title="Departments and admin"
        subtitle="Who is on the team, what each department owns, and what each role can do."
        actions={can('members:invite') ? <Button icon={<UserPlus size={12} />} onClick={() => setInviteOpen(true)}>Invite member</Button> : undefined}
      />

      <Tabs items={TABS} value={tab} onChange={setTab} label="Admin sections" />

      {tab === 'departments' && (
        <Card title="Departments" bodyClassName="p-0">
          {departments.loading ? <div className="p-4"><LoadingState rows={5} label="Loading departments" /></div>
            : departments.error ? <div className="p-4"><ErrorState error={departments.error} onRetry={departments.reload} /></div>
            : (departments.data ?? []).length === 0 ? <EmptyState title="No departments yet" body="Set them up in the workspace wizard." />
            : <DataTable columns={deptCols} rows={departments.data ?? []} caption="Departments" minWidth={700} />}
        </Card>
      )}

      {tab === 'members' && (
        <Card title="Members" action={deptSelect} bodyClassName="p-0">
          {members.loading ? <div className="p-4"><LoadingState rows={6} label="Loading members" /></div>
            : members.error ? <div className="p-4"><ErrorState error={members.error} onRetry={members.reload} /></div>
            : shown.length === 0 ? <EmptyState title="No members in this department" body="Invite someone or pick another department." action={can('members:invite') ? <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>Invite member</Button> : undefined} />
            : <DataTable columns={memberCols} rows={shown} caption="Members" minWidth={680} />}
        </Card>
      )}

      {tab === 'permissions' && (
        <Card title="Role permissions" bodyClassName="p-0">
          {matrix.loading ? <div className="p-4"><LoadingState rows={6} label="Loading permissions" /></div>
            : matrix.error ? <div className="p-4"><ErrorState error={matrix.error} onRetry={matrix.reload} /></div>
            : (
              <table className="w-full border-collapse text-left text-caption" style={{ minWidth: 640 }}>
                <caption className="sr-only">Permission matrix by role</caption>
                <thead className="bg-slate-50 text-micro uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Permission</th>
                    {ROLES.map((r) => <th key={r} scope="col" className="px-3 py-2 text-center font-semibold">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(matrix.data ?? []).map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <th scope="row" className="px-4 py-2 text-left font-medium text-ink">{row.label}</th>
                      {ROLES.map((r) => (
                        <td key={r} className="px-3 py-2 text-center">
                          <span aria-label={`${r} ${row.grants[r] ? 'allowed' : 'not allowed'}`} className={row.grants[r] ? 'text-emerald-600' : 'text-slate-300'}>{row.grants[r] ? '✓' : '-'}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </Card>
      )}

      <InviteDialog open={inviteOpen} departments={departments.data ?? []} onClose={() => setInviteOpen(false)} onInvited={(m) => setAdded((a) => [m, ...a])} />
    </SidebarLayout>
  );
}
