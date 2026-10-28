// Typed contract for the Officeroom frontend. Components depend ONLY on these types
// and on the `Api` interface, never on mock data. When the real backend lands,
// implement `Api` with fetch calls (see src/api/index.ts).

export type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'amber' | 'teal' | 'indigo';

// ---------- Shared identity (ids are UUID strings in the REST contract) ----------
export type Role = 'Owner' | 'Admin' | 'Manager' | 'Member';

export interface User {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  role: Role;
  tone: Tone;
  departmentId?: string;
  location: string;
}

export interface Business {
  id: string;
  name: string;
  sector: string;
  city: string;
  state: string;
  size: '1-10' | '11-50' | '51-200' | '200+';
  currency: 'NGN';
}

export interface CurrentUser {
  id: string;
  name: string;
  fullName: string;
  role: string;
  greeting: string;
  initials: string;
}

// ---------- Dashboard ----------
export interface StatMetric {
  id: string;
  label: string;
  value: string;
  /** Percent change, e.g. 24.5 means +24.5%. */
  change: number;
  changeNote: string;
  tone: Tone;
  icon: 'tasks' | 'files' | 'ai' | 'clock' | 'report' | 'users' | 'briefcase' | 'calendar' | 'trend' | 'database' | 'table' | 'storage' | 'source' | 'copy';
  sparkline: number[];
}

export interface WorkOverviewPoint {
  date: string;
  tasks: number;
  files: number;
  ai: number;
}

export interface WorkOverview {
  range: string;
  points: WorkOverviewPoint[];
  totals: { tasks: number; files: number; ai: number; reports: number };
}

export type FileKind = 'Excel' | 'Document' | 'PDF' | 'CSV' | 'PowerPoint' | 'Word';
export type FileStatus = 'Edited' | 'Viewed' | 'Analyzed';

export interface FileItem {
  id: string;
  name: string;
  kind: FileKind;
  workspace: string;
  lastModified: string;
  status: FileStatus;
  // Data Center extras
  datasetOrSource?: string;
  owner?: string;
  size?: string;
  tag?: string;
  // File Workspace extras
  folderId?: string;
  sizeBytes?: number;
  modifiedAt?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  departmentId?: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  members: number;
  activeWorkflows: number;
  activity: number;
  tone: Tone;
}

export interface TaskStatusSlice {
  label: string;
  value: number;
  percent: number;
  tone: Tone;
}

export interface TaskStatus {
  total: number;
  slices: TaskStatusSlice[];
}

export interface ActivityItem {
  id: string;
  text: string;
  subtext: string;
  time: string;
  kind: FileKind | 'AI' | 'Upload';
}

export type AIActionStatus = 'Completed' | 'In Progress' | 'Queued';

export interface AIAction {
  id: string;
  title: string;
  app: string;
  status: AIActionStatus;
  progress?: number;
}

// ---------- AI Copilot ----------
export interface ChatAttachment {
  name: string;
  meta: string;
  actionLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  attachment?: ChatAttachment;
  read?: boolean;
}

export interface CopilotThread {
  messages: ChatMessage[];
  suggestions: string[];
}

// ---------- People ----------
export interface PeopleStat {
  id: string;
  label: string;
  value: string;
  change: number;
  changeNote: string;
  tone: Tone;
  icon: StatMetric['icon'];
  sparkline: number[];
}

export type EmployeeStatus = 'Active' | 'On Leave';
export type EmployeeTab = 'Employee Directory' | 'New Hires' | 'Onboarding' | 'Exits';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  location: string;
  status: EmployeeStatus;
  tenure: string;
  email: string;
  initials: string;
  tone: Tone;
}

export interface EmployeeQuery {
  search?: string;
  department?: string;
  location?: string;
  status?: EmployeeStatus | '';
  tab?: EmployeeTab;
  page?: number;
  pageSize?: number;
}

export interface EmployeePage {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Slice {
  label: string;
  value: number;
  percent: number;
  tone: Tone;
  count?: number;
}

export interface PeopleAnalytics {
  gender: Slice[];
  departments: Slice[];
}

export interface Birthday {
  id: string;
  name: string;
  date: string;
  initials: string;
  tone: Tone;
}

export interface TimeOffRequest {
  id: string;
  name: string;
  type: string;
  range: string;
  days: number;
  initials: string;
  tone: Tone;
}

export interface Team {
  id: string;
  name: string;
  members: number;
  openPositions: number;
  activity: number;
  tone: Tone;
  extraAvatars: number;
  avatarInitials: string[];
}

export interface SidebarLink {
  label: string;
  to?: string;
  count?: number;
}

// ---------- Workspace (spreadsheet / docs / pdf) ----------
export interface WorkbookSheetRow {
  metric: string;
  actual: string;
  target: string;
  varianceN: string;
  variancePct: string;
  status: 'Favorable' | 'Unfavorable';
  comment: string;
}

export interface Workbook {
  name: string;
  title: string;
  date: string;
  activeCell: string;
  formula: string;
  sheets: string[];
  activeSheet: string;
  savedAgo: string;
  rows: WorkbookSheetRow[];
}

export interface DocumentPreview {
  name: string;
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
  words: number;
}

export interface PdfPreview {
  name: string;
  title: string;
  date: string;
  overview: string;
  page: number;
  pageCount: number;
  zoom: number;
  totalBudget: string;
  donut: Slice[];
}

export interface WorkspaceMeta {
  name: string;
  plan: string;
  tabs: string[];
  fileTabs: { name: string; kind: FileKind }[];
}

// ---------- Data Center ----------
export interface DataStat {
  id: string;
  label: string;
  value: string;
  change: number;
  changeNote: string;
  tone: Tone;
  icon: StatMetric['icon'];
  sparkline: number[];
}

export type DataSourceStatus = 'Healthy' | 'Warning';

export interface DataSource {
  id: string;
  name: string;
  kind: string;
  status: DataSourceStatus;
  tone: Tone;
}

export interface DataInsights {
  topGrowth: { label: string; value: string; bars: number[] };
  mostActive: { name: string; updates: number; sparkline: number[] };
  quality: { score: number; label: string };
  duplicates: { count: number; note: string; sparkline: number[] };
}

export interface QualityAlert {
  id: string;
  message: string;
  dataset: string;
  time: string;
  severity: 'warning' | 'critical';
}

export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  owner: string;
  tables: number;
  records: string;
  updated: string;
  avatars: number;
  tone: Tone;
}

export interface StorageInfo {
  usedTb: number;
  totalTb: number;
  percent: number;
}

// ---------- Departments & admin ----------
export interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
  memberCount: number;
  activeWorkflows: number;
  activity: number;
  tone: Tone;
}

export type MemberStatus = 'Active' | 'Invited' | 'Suspended';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  tone: Tone;
  role: Role;
  departmentId: string;
  departmentName: string;
  status: MemberStatus;
  lastActive: string;
}

export interface InviteInput {
  fullName: string;
  email: string;
  role: Role;
  departmentId: string;
}

export interface PermissionRow {
  id: string;
  label: string;
  grants: Record<Role, boolean>;
}

export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'failed';
  error?: string;
}

// ---------- Setup wizard ----------
export interface SetupInput {
  business: Omit<Business, 'id' | 'currency'>;
  teamSize: number;
  departments: string[];
  goals: string[];
}

export interface PlanDepartment {
  name: string;
  lead: string;
  purpose: string;
  folders: string[];
}

export interface WorkspacePlan {
  departments: PlanDepartment[];
  goals: string[];
  rationale: string;
}

// ---------- Audit ----------
export type AuditCategory = 'auth' | 'file' | 'member' | 'department' | 'workspace' | 'ai';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: Role;
  action: string;
  category: AuditCategory;
  target: string;
  ip: string;
  outcome: 'success' | 'failed';
}

export interface AuditQuery {
  search?: string;
  category?: AuditCategory | '';
  outcome?: 'success' | 'failed' | '';
  sinceDays?: number;
}

// ---------- Messaging ----------
export interface Channel {
  id: string;
  name: string;
  kind: 'channel' | 'dm';
  unread: number;
  preview: string;
  time: string;
  tone: Tone;
  initials: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorName: string;
  initials: string;
  tone: Tone;
  text: string;
  time: string;
  mine: boolean;
}

export interface SidebarSection {
  title?: string;
  links: SidebarLink[];
}

// ---------- The Api contract ----------
export type Api = CoreApi & OfficeApi;

export interface CoreApi {
  // shared
  getCurrentUser(): Promise<CurrentUser>;

  // dashboard
  getDashboardStats(): Promise<StatMetric[]>;
  getWorkOverview(range: string): Promise<WorkOverview>;
  listRecentFiles(kind?: FileKind | 'All' | 'More'): Promise<FileItem[]>;
  listWorkspaces(): Promise<WorkspaceSummary[]>;
  getTaskStatus(): Promise<TaskStatus>;
  listActivities(): Promise<ActivityItem[]>;
  listAIActions(): Promise<AIAction[]>;

  // AI copilot
  getCopilotThread(): Promise<CopilotThread>;
  sendCopilotMessage(text: string): Promise<ChatMessage>;

  // people
  getPeopleStats(): Promise<PeopleStat[]>;
  listEmployees(query: EmployeeQuery): Promise<EmployeePage>;
  getPeopleAnalytics(): Promise<PeopleAnalytics>;
  listPeopleActivities(): Promise<ActivityItem[]>;
  listTimeOff(): Promise<TimeOffRequest[]>;
  listUpcomingBirthdays(): Promise<Birthday[]>;
  listTeams(): Promise<Team[]>;
  getPeopleSidebar(): Promise<SidebarSection[]>;

  // workspace
  getWorkspaceMeta(): Promise<WorkspaceMeta>;
  getWorkbook(name: string): Promise<Workbook>;
  getDocumentPreview(name: string): Promise<DocumentPreview>;
  getPdfPreview(name: string): Promise<PdfPreview>;
  listWorkspaceFiles(): Promise<FileItem[]>;

  // data center
  getDataSidebar(): Promise<SidebarSection[]>;
  getStorage(): Promise<StorageInfo>;
  getDataStats(): Promise<DataStat[]>;
  listDataFiles(kind?: FileKind | 'All' | 'More'): Promise<FileItem[]>;
  listDataSources(): Promise<DataSource[]>;
  getDataInsights(): Promise<DataInsights>;
  listQualityAlerts(): Promise<QualityAlert[]>;
  listCatalog(): Promise<CatalogEntry[]>;
}

export interface OfficeApi {
  // auth
  signIn(email: string, password: string): Promise<User>;
  register(input: { fullName: string; email: string; password: string; businessName: string }): Promise<User>;
  requestPasswordReset(email: string): Promise<void>;

  // business & setup wizard
  getBusiness(): Promise<Business>;
  generateWorkspacePlan(input: SetupInput): Promise<WorkspacePlan>;
  acceptWorkspacePlan(plan: WorkspacePlan): Promise<{ workspaceId: string }>;

  // files
  listFolders(): Promise<FolderItem[]>;
  listFiles(folderId: string): Promise<FileItem[]>;
  getFile(id: string): Promise<FileItem>;
  uploadFile(folderId: string, file: { name: string; sizeBytes: number }, onProgress: (pct: number) => void): Promise<FileItem>;

  // departments & admin
  listDepartments(): Promise<Department[]>;
  listMembers(departmentId?: string): Promise<Member[]>;
  getPermissionMatrix(): Promise<PermissionRow[]>;
  inviteMember(input: InviteInput): Promise<Member>;

  // audit
  listAuditEvents(query: AuditQuery): Promise<AuditEvent[]>;

  // messaging
  listChannels(): Promise<Channel[]>;
  listMessages(channelId: string): Promise<Message[]>;
  sendMessage(channelId: string, text: string): Promise<Message>;
}
