import type {
  AuditEvent, Business, Channel, Department, FileItem, FolderItem, Member, Message,
  PermissionRow, SetupInput, User, WorkspacePlan, AuditQuery, OfficeApi,
} from './types';
import { delay, fail } from './delay';

/* Office (Officeroom) mock data. Nigerian sample businesses, Lagos/Abuja, amounts in ₦. */

const BUSINESS: Business = {
  id: '22222222-2222-4222-8222-000000000001',
  name: 'Adeola Spices & Foods Ltd',
  sector: 'Food manufacturing',
  city: 'Lagos',
  state: 'Lagos',
  size: '51-200',
  currency: 'NGN',
};

const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Finance', head: 'Tobi Adewale', description: 'Budgets, invoices, payroll and cash flow.', memberCount: 9, activeWorkflows: 24, activity: 78, tone: 'blue' },
  { id: 'd2', name: 'Human Resources', head: 'Mary Okoro', description: 'Hiring, onboarding, leave and staff records.', memberCount: 6, activeWorkflows: 16, activity: 64, tone: 'green' },
  { id: 'd3', name: 'Operations', head: 'John Smith', description: 'Production, procurement and logistics across Lagos and Ogun.', memberCount: 14, activeWorkflows: 20, activity: 72, tone: 'purple' },
  { id: 'd4', name: 'Sales', head: 'Tomi Salami', description: 'Distributor accounts, orders and Abuja retail partners.', memberCount: 11, activeWorkflows: 18, activity: 68, tone: 'amber' },
  { id: 'd5', name: 'Marketing', head: 'Grace Williams', description: 'Campaigns, brand assets and social content.', memberCount: 4, activeWorkflows: 6, activity: 52, tone: 'teal' },
];

const MEMBERS: Member[] = [
  { id: 'm1', fullName: 'Chinedu Okafor', email: 'chinedu@adeolaspices.ng', initials: 'CO', tone: 'blue', role: 'Owner', departmentId: 'd1', departmentName: 'Finance', status: 'Active', lastActive: 'Just now' },
  { id: 'm2', fullName: 'Ngozi Eze', email: 'ngozi@adeolaspices.ng', initials: 'NE', tone: 'purple', role: 'Admin', departmentId: 'd2', departmentName: 'Human Resources', status: 'Active', lastActive: '12 mins ago' },
  { id: 'm3', fullName: 'Tobi Adewale', email: 'tobi@adeolaspices.ng', initials: 'TA', tone: 'green', role: 'Manager', departmentId: 'd1', departmentName: 'Finance', status: 'Active', lastActive: '2 mins ago' },
  { id: 'm4', fullName: 'Aisha Bello', email: 'aisha@adeolaspices.ng', initials: 'AB', tone: 'orange', role: 'Member', departmentId: 'd1', departmentName: 'Finance', status: 'Active', lastActive: '1 hour ago' },
  { id: 'm5', fullName: 'John Smith', email: 'john.smith@adeolaspices.ng', initials: 'JS', tone: 'teal', role: 'Manager', departmentId: 'd3', departmentName: 'Operations', status: 'Active', lastActive: '32 mins ago' },
  { id: 'm6', fullName: 'Mary Okoro', email: 'mary.okoro@adeolaspices.ng', initials: 'MO', tone: 'purple', role: 'Manager', departmentId: 'd2', departmentName: 'Human Resources', status: 'Active', lastActive: 'Yesterday' },
  { id: 'm7', fullName: 'Emeka Johnson', email: 'emeka.johnson@adeolaspices.ng', initials: 'EJ', tone: 'blue', role: 'Member', departmentId: 'd3', departmentName: 'Operations', status: 'Active', lastActive: '3 hours ago' },
  { id: 'm8', fullName: 'Tomi Salami', email: 'tomi.salami@adeolaspices.ng', initials: 'TS', tone: 'green', role: 'Manager', departmentId: 'd4', departmentName: 'Sales', status: 'Active', lastActive: '5 mins ago' },
  { id: 'm9', fullName: 'Grace Williams', email: 'grace.williams@adeolaspices.ng', initials: 'GW', tone: 'purple', role: 'Member', departmentId: 'd5', departmentName: 'Marketing', status: 'Invited', lastActive: 'Never' },
  { id: 'm10', fullName: 'Ifeoma Nwankwo', email: 'ifeoma.n@adeolaspices.ng', initials: 'IN', tone: 'amber', role: 'Member', departmentId: 'd4', departmentName: 'Sales', status: 'Suspended', lastActive: '2 weeks ago' },
];

const PERMISSIONS: PermissionRow[] = [
  { id: 'p1', label: 'View dashboard and reports', grants: { Owner: true, Admin: true, Manager: true, Member: true } },
  { id: 'p2', label: 'View files in own department', grants: { Owner: true, Admin: true, Manager: true, Member: true } },
  { id: 'p3', label: 'Upload and edit files', grants: { Owner: true, Admin: true, Manager: true, Member: false } },
  { id: 'p4', label: 'Manage departments', grants: { Owner: true, Admin: true, Manager: false, Member: false } },
  { id: 'p5', label: 'Invite and remove members', grants: { Owner: true, Admin: true, Manager: false, Member: false } },
  { id: 'p6', label: 'Change member roles', grants: { Owner: true, Admin: false, Manager: false, Member: false } },
  { id: 'p7', label: 'View audit log', grants: { Owner: true, Admin: true, Manager: false, Member: false } },
  { id: 'p8', label: 'Billing and subscription', grants: { Owner: true, Admin: false, Manager: false, Member: false } },
];

const FOLDERS: FolderItem[] = [
  { id: 'f-root-fin', name: 'Finance', parentId: null, path: '/Finance', departmentId: 'd1' },
  { id: 'f-fin-reports', name: 'Monthly Reports', parentId: 'f-root-fin', path: '/Finance/Monthly Reports', departmentId: 'd1' },
  { id: 'f-fin-invoices', name: 'Invoices 2026', parentId: 'f-root-fin', path: '/Finance/Invoices 2026', departmentId: 'd1' },
  { id: 'f-root-hr', name: 'Human Resources', parentId: null, path: '/Human Resources', departmentId: 'd2' },
  { id: 'f-hr-policies', name: 'Policies', parentId: 'f-root-hr', path: '/Human Resources/Policies', departmentId: 'd2' },
  { id: 'f-root-ops', name: 'Operations', parentId: null, path: '/Operations', departmentId: 'd3' },
  { id: 'f-root-sales', name: 'Sales', parentId: null, path: '/Sales', departmentId: 'd4' },
];

const FILES: FileItem[] = [
  { id: 'fl1', folderId: 'f-fin-reports', name: 'Morning_Report.xlsx', kind: 'Excel', workspace: 'Finance', lastModified: 'Today, 10:34 AM', modifiedAt: '2026-10-24T10:34:00+01:00', status: 'Edited', sizeBytes: 126976, owner: 'Tobi Adewale', size: '124 KB' },
  { id: 'fl2', folderId: 'f-fin-reports', name: 'Q3_Financials.docx', kind: 'Document', workspace: 'Finance', lastModified: 'Today, 10:21 AM', modifiedAt: '2026-10-24T10:21:00+01:00', status: 'Viewed', sizeBytes: 302080, owner: 'Aisha Bello', size: '295 KB' },
  { id: 'fl3', folderId: 'f-fin-invoices', name: 'Budget_Analysis.pdf', kind: 'PDF', workspace: 'Finance', lastModified: 'Today, 09:48 AM', modifiedAt: '2026-10-24T09:48:00+01:00', status: 'Viewed', sizeBytes: 1258291, owner: 'Chinedu Okafor', size: '1.2 MB' },
  { id: 'fl4', folderId: 'f-hr-policies', name: 'HR_Headcount.csv', kind: 'CSV', workspace: 'HR', lastModified: 'Yesterday, 4:30 PM', modifiedAt: '2026-10-23T16:30:00+01:00', status: 'Analyzed', sizeBytes: 48128, owner: 'Mary Okoro', size: '47 KB' },
  { id: 'fl5', folderId: 'f-root-sales', name: 'Sales_Data_Q3.csv', kind: 'CSV', workspace: 'Sales', lastModified: 'Yesterday, 2:15 PM', modifiedAt: '2026-10-23T14:15:00+01:00', status: 'Analyzed', sizeBytes: 215040, owner: 'Tomi Salami', size: '210 KB' },
  { id: 'fl6', folderId: 'f-fin-invoices', name: 'Invoice_Batch_0924.pdf', kind: 'PDF', workspace: 'Finance', lastModified: 'Oct 22, 3:02 PM', modifiedAt: '2026-10-22T15:02:00+01:00', status: 'Viewed', sizeBytes: 884736, owner: 'Tobi Adewale', size: '864 KB' },
  { id: 'fl7', folderId: 'f-root-ops', name: 'Production_Plan_Oct.xlsx', kind: 'Excel', workspace: 'Operations', lastModified: 'Oct 21, 9:12 AM', modifiedAt: '2026-10-21T09:12:00+01:00', status: 'Edited', sizeBytes: 402432, owner: 'John Smith', size: '393 KB' },
];

const AUDIT: AuditEvent[] = [
  { id: 'a1', timestamp: '2026-10-24T16:58:00+01:00', actor: 'Tobi Adewale', actorRole: 'Manager', action: 'Edited file', category: 'file', target: 'Morning_Report.xlsx', ip: '102.89.34.12', outcome: 'success' },
  { id: 'a2', timestamp: '2026-10-24T16:41:00+01:00', actor: 'Chinedu Okafor', actorRole: 'Owner', action: 'Invited member', category: 'member', target: 'grace.williams@adeolaspices.ng', ip: '197.210.55.8', outcome: 'success' },
  { id: 'a3', timestamp: '2026-10-24T15:20:00+01:00', actor: 'Ngozi Eze', actorRole: 'Admin', action: 'Changed department', category: 'department', target: 'Marketing', ip: '197.210.55.9', outcome: 'success' },
  { id: 'a4', timestamp: '2026-10-24T14:02:00+01:00', actor: 'Emeka Johnson', actorRole: 'Member', action: 'Sign-in', category: 'auth', target: 'Password', ip: '105.112.20.44', outcome: 'failed' },
  { id: 'a5', timestamp: '2026-10-24T11:12:00+01:00', actor: 'AI Assistant', actorRole: 'Admin', action: 'Ran data analysis', category: 'ai', target: 'Sales_Data_Q3.csv', ip: 'system', outcome: 'success' },
  { id: 'a6', timestamp: '2026-10-23T17:30:00+01:00', actor: 'Mary Okoro', actorRole: 'Manager', action: 'Uploaded file', category: 'file', target: 'HR_Headcount.csv', ip: '105.112.31.2', outcome: 'success' },
  { id: 'a7', timestamp: '2026-10-23T09:05:00+01:00', actor: 'Tomi Salami', actorRole: 'Manager', action: 'Created workspace', category: 'workspace', target: 'Sales (Abuja)', ip: '41.58.90.17', outcome: 'success' },
  { id: 'a8', timestamp: '2026-10-22T13:44:00+01:00', actor: 'Ifeoma Nwankwo', actorRole: 'Member', action: 'Suspended account', category: 'member', target: 'Ifeoma Nwankwo', ip: '197.210.55.9', outcome: 'success' },
  { id: 'a9', timestamp: '2026-10-22T08:16:00+01:00', actor: 'Aisha Bello', actorRole: 'Member', action: 'Sign-in', category: 'auth', target: 'Password', ip: '105.112.20.40', outcome: 'success' },
];

const CHANNELS: Channel[] = [
  { id: 'c1', name: 'finance-team', kind: 'channel', unread: 3, preview: 'Morning report is up, check row 7', time: '10:41', tone: 'blue', initials: 'FT' },
  { id: 'c2', name: 'operations', kind: 'channel', unread: 0, preview: 'Ogun shipment cleared customs', time: '09:12', tone: 'purple', initials: 'OP' },
  { id: 'c3', name: 'sales-abuja', kind: 'channel', unread: 1, preview: 'Need the Q3 price sheet by Monday', time: 'Yesterday', tone: 'amber', initials: 'SA' },
  { id: 'c4', name: 'Mary Okoro', kind: 'dm', unread: 0, preview: 'Thanks, I have updated the policy', time: 'Mon', tone: 'purple', initials: 'MO' },
];

const MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'msg1', channelId: 'c1', authorName: 'Tobi Adewale', initials: 'TA', tone: 'green', text: 'Morning report is up. Check row 7, the cash position dipped after the Ikeja payroll run.', time: '10:34', mine: false },
    { id: 'msg2', channelId: 'c1', authorName: 'Aisha Bello', initials: 'AB', tone: 'orange', text: 'Got it. I will reconcile the Q3 invoices against that by 2pm.', time: '10:38', mine: false },
    { id: 'msg3', channelId: 'c1', authorName: 'Chinedu Okafor', initials: 'CO', tone: 'blue', text: 'Good. Let us review the numbers in the Thursday call.', time: '10:41', mine: true },
  ],
  c2: [{ id: 'msg4', channelId: 'c2', authorName: 'John Smith', initials: 'JS', tone: 'teal', text: 'Ogun shipment cleared customs this morning. Truck leaves the Apapa depot at noon.', time: '09:12', mine: false }],
  c3: [{ id: 'msg5', channelId: 'c3', authorName: 'Tomi Salami', initials: 'TS', tone: 'green', text: 'Need the Q3 price sheet by Monday for the Abuja retail partners.', time: 'Yesterday', mine: false }],
  c4: [{ id: 'msg6', channelId: 'c4', authorName: 'Mary Okoro', initials: 'MO', tone: 'purple', text: 'Thanks, I have updated the leave policy.', time: 'Mon', mine: false }],
};

const WORKSPACE_PLAN_DEFAULT = (input: SetupInput): WorkspacePlan => ({
  departments: input.departments.map((name, i) => ({
    name,
    lead: MEMBERS[i % MEMBERS.length].fullName,
    purpose: `Runs ${name.toLowerCase()} workflows and keeps the shared files for the team.`,
    folders: ['Working files', 'Reports', 'Archive'],
  })),
  goals: input.goals.length ? input.goals : ['Close the month faster', 'Keep payroll on schedule'],
  rationale: `Built for a ${input.business.size} team in ${input.business.city}. Departments and folders follow the goals you picked.`,
});

/** Shared in-memory state so uploads and invites stick for the session. */
const state = {
  files: [...FILES],
  members: [...MEMBERS],
  messages: { ...MESSAGES } as Record<string, Message[]>,
};

const currentUser: User = {
  id: '11111111-1111-4111-8111-000000000001',
  fullName: 'Chinedu Okafor',
  email: 'chinedu@adeolaspices.ng',
  initials: 'CO',
  role: 'Owner',
  tone: 'blue',
  location: 'Lagos, Nigeria',
};

export const officeMockApi: OfficeApi = {
  // auth
  signIn: (email) => (email.includes('@') ? delay(currentUser) : fail('Enter a valid email address.')),
  register: (input) => delay<User>({ ...currentUser, fullName: input.fullName, email: input.email }),
  requestPasswordReset: (email) => (email.includes('@') ? delay<void>(undefined) : fail('Enter a valid email address.')),
  resetPassword: () => delay<void>(undefined),
  logout: () => delay<void>(undefined),

  // business & setup
  getBusiness: () => delay(BUSINESS),
  generateWorkspacePlan: (input) => delay(WORKSPACE_PLAN_DEFAULT(input), 900),
  acceptWorkspacePlan: () => delay({ workspaceId: '33333333-3333-4333-8333-000000000001' }),

  // files
  listFolders: () => delay(FOLDERS),
  listFiles: (folderId) => delay(state.files.filter((f) => f.folderId === folderId)),
  getFile: (id) => {
    const f = state.files.find((x) => x.id === id);
    return f ? delay(f) : fail('File not found.');
  },
  uploadFile: (folderId, file, onProgress) =>
    new Promise((resolve, reject) => {
      let pct = 0;
      const tick = setInterval(() => {
        pct = Math.min(100, pct + 12 + Math.random() * 10);
        onProgress(Math.round(pct));
        if (pct >= 100) {
          clearInterval(tick);
          if (file.name.toLowerCase().endsWith('.exe')) {
            reject(new Error('This file type is not allowed.'));
            return;
          }
          const created: FileItem = {
            id: `fl_${Date.now()}`,
            folderId,
            name: file.name,
            kind: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : file.name.toLowerCase().endsWith('.csv') ? 'CSV' : file.name.toLowerCase().endsWith('.xlsx') ? 'Excel' : 'Document',
            workspace: 'Finance',
            lastModified: 'Just now',
            modifiedAt: new Date().toISOString(),
            status: 'Viewed',
            sizeBytes: file.sizeBytes,
            size: `${Math.max(1, Math.round(file.sizeBytes / 1024))} KB`,
            owner: currentUser.fullName,
          };
          state.files = [created, ...state.files];
          resolve(created);
        }
      }, 220);
    }),

  // departments & admin
  listDepartments: () => delay(DEPARTMENTS),
  listMembers: (departmentId) => delay(departmentId ? state.members.filter((m) => m.departmentId === departmentId) : [...state.members]),
  getPermissionMatrix: () => delay(PERMISSIONS),
  inviteMember: (input) => {
    if (state.members.some((m) => m.email === input.email)) return fail('That email is already on the team.');
    const dept = DEPARTMENTS.find((d) => d.id === input.departmentId);
    const m: Member = {
      id: `m_${Date.now()}`,
      fullName: input.fullName,
      email: input.email,
      initials: input.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
      tone: 'blue',
      role: input.role,
      departmentId: input.departmentId,
      departmentName: dept?.name ?? 'Unassigned',
      status: 'Invited',
      lastActive: 'Never',
    };
    state.members = [m, ...state.members];
    return delay(m);
  },

  // audit
  listAuditEvents: (query: AuditQuery) => {
    const q = (query.search ?? '').trim().toLowerCase();
    const rows = AUDIT.filter((e) => {
      if (q && !`${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(q)) return false;
      if (query.category && e.category !== query.category) return false;
      if (query.outcome && e.outcome !== query.outcome) return false;
      return true;
    });
    return delay(rows, 400);
  },

  // messaging
  listChannels: () => delay(CHANNELS),
  listMessages: (channelId) => delay(state.messages[channelId] ?? []),
  sendMessage: (channelId, text) => {
    const msg: Message = { id: `msg_${Date.now()}`, channelId, authorName: currentUser.fullName, initials: currentUser.initials, tone: currentUser.tone, text, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), mine: true };
    state.messages[channelId] = [...(state.messages[channelId] ?? []), msg];
    return delay(msg, 200);
  },
};
