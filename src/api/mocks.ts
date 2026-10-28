import type {
  CoreApi,
  AIAction,
  ActivityItem,
  Birthday,
  CatalogEntry,
  ChatMessage,
  CopilotThread,
  CurrentUser,
  DataInsights,
  DataSource,
  DataStat,
  DocumentPreview,
  Employee,
  EmployeePage,
  EmployeeQuery,
  FileItem,
  PdfPreview,
  PeopleAnalytics,
  PeopleStat,
  QualityAlert,
  SidebarSection,
  StatMetric,
  StorageInfo,
  Team,
  TaskStatus,
  TimeOffRequest,
  Workbook,
  WorkspaceMeta,
  WorkspaceSummary,
  WorkOverview,
} from './types';

import { delay } from './delay';

/**
 * Mock implementation of the Api contract. Data mirrors the four design screens.
 * Every call resolves after a short artificial delay so loading states are exercised.
 */



const USER: CurrentUser = {
  id: 'u_john',
  name: 'John',
  fullName: 'John Adeyemi',
  role: 'Super Admin',
  greeting: 'Good morning, John!',
  initials: 'JA',
};

const DASHBOARD_STATS: StatMetric[] = [
  { id: 'tasks', label: 'Tasks Executed Today', value: '1,247', change: 24.5, changeNote: 'vs yesterday', tone: 'blue', icon: 'tasks', sparkline: [12, 18, 14, 22, 19, 28, 25, 34, 30, 38] },
  { id: 'files', label: 'Files Analyzed', value: '3,421', change: 18.7, changeNote: 'vs yesterday', tone: 'green', icon: 'files', sparkline: [20, 16, 24, 22, 30, 27, 33, 31, 37, 40] },
  { id: 'ai', label: 'AI Executions', value: '1,890', change: 31.2, changeNote: 'vs yesterday', tone: 'purple', icon: 'ai', sparkline: [10, 14, 12, 18, 16, 22, 21, 27, 30, 33] },
  { id: 'time', label: 'Time Saved', value: '186h', change: 26.4, changeNote: 'vs yesterday', tone: 'blue', icon: 'clock', sparkline: [8, 10, 9, 13, 12, 15, 17, 16, 20, 22] },
  { id: 'reports', label: 'Reports Generated', value: '122', change: 15.3, changeNote: 'vs yesterday', tone: 'orange', icon: 'report', sparkline: [5, 9, 7, 11, 8, 12, 10, 14, 13, 16] },
];

const WORK_OVERVIEW: WorkOverview = {
  range: 'This Week',
  points: [
    { date: 'May 24', tasks: 1100, files: 1500, ai: 700 },
    { date: 'May 25', tasks: 1350, files: 1800, ai: 900 },
    { date: 'May 26', tasks: 1250, files: 1650, ai: 820 },
    { date: 'May 27', tasks: 1950, files: 2300, ai: 1250 },
    { date: 'May 28', tasks: 1500, files: 2050, ai: 1020 },
    { date: 'May 29', tasks: 1050, files: 1450, ai: 760 },
    { date: 'May 30', tasks: 1530, files: 2100, ai: 1100 },
  ],
  totals: { tasks: 8729, files: 18842, ai: 9412, reports: 684 },
};

const RECENT_FILES: FileItem[] = [
  { id: 'f1', name: 'Morning_Report.xlsx', kind: 'Excel', workspace: 'Finance', lastModified: 'Today, 10:34 AM', status: 'Edited', datasetOrSource: 'Finance Analytics', owner: 'John Adeyemi', size: '124 KB', tag: 'Finance' },
  { id: 'f2', name: 'Q2_Financials.docx', kind: 'Document', workspace: 'Finance', lastModified: 'Today, 10:21 AM', status: 'Viewed', datasetOrSource: 'Finance Analytics', owner: 'Mary Okoro', size: '318 KB', tag: 'Reports' },
  { id: 'f3', name: 'Budget_Analysis.pdf', kind: 'PDF', workspace: 'Finance', lastModified: 'Today, 09:48 AM', status: 'Viewed', datasetOrSource: 'Executive Reports', owner: 'Tobi Adewale', size: '1.2 MB', tag: 'Reports' },
  { id: 'f4', name: 'HR_Headcount.csv', kind: 'CSV', workspace: 'HR', lastModified: 'Yesterday, 04:30 PM', status: 'Analyzed', datasetOrSource: 'HR Warehouse', owner: 'Mary Okoro', size: '640 KB', tag: 'HR' },
  { id: 'f5', name: 'Sales_Data_May.csv', kind: 'CSV', workspace: 'Sales', lastModified: 'Yesterday, 02:15 PM', status: 'Analyzed', datasetOrSource: 'Sales Analytics', owner: 'Tomi Salami', size: '2.1 MB', tag: 'Sales' },
];

const DATA_FILES: FileItem[] = [
  { id: 'd1', name: 'Q2_Performance_Analysis.xlsx', kind: 'Excel', workspace: 'Finance', lastModified: 'Today, 10:34 AM', status: 'Edited', datasetOrSource: 'Finance Analytics', owner: 'Tobi Adewale', size: '2.4 MB', tag: 'Finance' },
  { id: 'd2', name: 'Employee_Compensation.csv', kind: 'CSV', workspace: 'HR', lastModified: 'Today, 09:21 AM', status: 'Analyzed', datasetOrSource: 'HR Warehouse', owner: 'Mary Okoro', size: '1.7 MB', tag: 'HR' },
  { id: 'd3', name: 'Board_Presentation.pdf', kind: 'PDF', workspace: 'Executive', lastModified: 'Today, 08:15 AM', status: 'Viewed', datasetOrSource: 'Executive Reports', owner: 'John Adeyemi', size: '3.2 MB', tag: 'Reports' },
  { id: 'd4', name: 'Sales_Trend_May.xlsx', kind: 'Excel', workspace: 'Sales', lastModified: 'Yesterday, 04:30 PM', status: 'Analyzed', datasetOrSource: 'Sales Analytics', owner: 'Tomi Salami', size: '1.9 MB', tag: 'Sales' },
  { id: 'd5', name: 'Customer_Master_Data.csv', kind: 'CSV', workspace: 'Operations', lastModified: 'Yesterday, 02:12 PM', status: 'Analyzed', datasetOrSource: 'Customer 360', owner: 'Emeka Johnson', size: '6.7 MB', tag: 'Operations' },
  { id: 'd6', name: 'Audit_Log_May.pdf', kind: 'PDF', workspace: 'Compliance', lastModified: 'Yesterday, 11:08 AM', status: 'Viewed', datasetOrSource: 'Compliance Data', owner: 'Aisha Bello', size: '1.2 MB', tag: 'Compliance' },
  { id: 'd7', name: 'Inventory_Snapshot.xlsx', kind: 'Excel', workspace: 'Operations', lastModified: 'May 23, 2025', status: 'Edited', datasetOrSource: 'Inventory DB', owner: 'Tobi Adewale', size: '2.1 MB', tag: 'Operations' },
  { id: 'd8', name: 'Marketing_Campaigns.docx', kind: 'Document', workspace: 'Marketing', lastModified: 'May 23, 2025', status: 'Viewed', datasetOrSource: 'Marketing Data', owner: 'Adaeze Nwosu', size: '890 KB', tag: 'Marketing' },
];

const WORKSPACE_FILES: FileItem[] = [
  { id: 'w1', name: 'Morning_Report.xlsx', kind: 'Excel', workspace: 'Finance', lastModified: 'Today, 10:34 AM', status: 'Edited' },
  { id: 'w2', name: 'Q2_Financials.docx', kind: 'Document', workspace: 'Finance', lastModified: 'Today, 10:21 AM', status: 'Viewed' },
  { id: 'w3', name: 'Budget_Analysis.pdf', kind: 'PDF', workspace: 'Finance', lastModified: 'Today, 09:48 AM', status: 'Viewed' },
  { id: 'w4', name: 'HR_Headcount.csv', kind: 'CSV', workspace: 'HR', lastModified: 'Yesterday, 04:30 PM', status: 'Analyzed' },
  { id: 'w5', name: 'Sales_Data_May.csv', kind: 'CSV', workspace: 'Sales', lastModified: 'Yesterday, 02:15 PM', status: 'Analyzed' },
  { id: 'w6', name: 'Marketing_Plan.pptx', kind: 'PowerPoint', workspace: 'Marketing', lastModified: 'May 22, 04:10 PM', status: 'Viewed' },
  { id: 'w7', name: 'Team_Activities.docx', kind: 'Document', workspace: 'HR', lastModified: 'May 21, 11:20 AM', status: 'Viewed' },
];

const WORKSPACES: WorkspaceSummary[] = [
  { id: 'ws1', name: 'Finance', members: 128, activeWorkflows: 24, activity: 78, tone: 'blue' },
  { id: 'ws2', name: 'HR', members: 96, activeWorkflows: 16, activity: 64, tone: 'green' },
  { id: 'ws3', name: 'Operations', members: 112, activeWorkflows: 20, activity: 72, tone: 'purple' },
  { id: 'ws4', name: 'Sales', members: 84, activeWorkflows: 18, activity: 68, tone: 'orange' },
];

const TASK_STATUS: TaskStatus = {
  total: 2847,
  slices: [
    { label: 'Completed', value: 1530, percent: 53, tone: 'green' },
    { label: 'In Progress', value: 842, percent: 30, tone: 'blue' },
    { label: 'Pending', value: 321, percent: 11, tone: 'amber' },
    { label: 'Overdue', value: 154, percent: 8, tone: 'red' },
  ],
};

const ACTIVITIES: ActivityItem[] = [
  { id: 'a1', text: 'Tobi edited Morning_Report.xlsx', subtext: 'Finance Workspace', time: '2 mins ago', kind: 'Excel' },
  { id: 'a2', text: 'Mary viewed Q2_Financials.docx', subtext: 'Finance Workspace', time: '15 mins ago', kind: 'Document' },
  { id: 'a3', text: 'AI completed data analysis', subtext: 'HR Workspace', time: '32 mins ago', kind: 'AI' },
  { id: 'a4', text: 'John uploaded Budget_Analysis.pdf', subtext: 'Finance Workspace', time: '1 hour ago', kind: 'PDF' },
];

const PEOPLE_ACTIVITIES: ActivityItem[] = [
  { id: 'pa1', text: 'Aisha Bello completed onboarding', subtext: 'Finance', time: '2h ago', kind: 'Upload' },
  { id: 'pa2', text: 'Emeka Johnson updated profile', subtext: 'Information Technology', time: '5h ago', kind: 'Upload' },
  { id: 'pa3', text: 'Mary Okoro requested time off', subtext: 'Human Resources', time: '1d ago', kind: 'Upload' },
  { id: 'pa4', text: 'John Smith received promotion', subtext: 'Operations', time: '2d ago', kind: 'Upload' },
  { id: 'pa5', text: 'Tomi Salami joined the company', subtext: 'Sales', time: '3d ago', kind: 'Upload' },
];

const AI_ACTIONS: AIAction[] = [
  { id: 'ai1', title: 'Redesign Morning Report', app: 'Excel Editor', status: 'Completed', progress: 100 },
  { id: 'ai2', title: 'Analyze Q2 Financials', app: 'Data Analysis', status: 'In Progress', progress: 40 },
  { id: 'ai3', title: 'Compare Budget vs Actual', app: 'Excel Editor', status: 'Queued' },
  { id: 'ai4', title: 'Generate Executive Summary', app: 'Document Editor', status: 'Queued' },
];

const COPILOT_THREAD: CopilotThread = {
  messages: [
    {
      id: 'm1',
      role: 'user',
      text: 'Redesign my Morning Report using the saved template and include conditional formatting for performance.',
      time: '10:32 AM',
      read: true,
    },
    {
      id: 'm2',
      role: 'assistant',
      text: "Sure! I'll redesign your Morning Report using your saved template and add conditional formatting for performance metrics.",
      time: '10:34 AM',
      attachment: { name: 'Morning_Report_Redesigned.xlsx', meta: 'Excel Sheet • 124 KB', actionLabel: 'Open in Excel Editor' },
    },
  ],
  suggestions: ['Analyze this data', 'Create a report', 'Summarize this file', 'Extract insights', 'Find anomalies', 'Compare with last month'],
};

const PEOPLE_STATS: PeopleStat[] = [
  { id: 'total', label: 'Total Employees', value: '1,248', change: 8.6, changeNote: 'vs last month', tone: 'blue', icon: 'users', sparkline: [20, 22, 21, 25, 24, 28, 27, 31, 30, 34] },
  { id: 'active', label: 'Active Employees', value: '1,186', change: 7.4, changeNote: 'vs last month', tone: 'teal', icon: 'users', sparkline: [18, 19, 21, 20, 24, 23, 27, 26, 29, 31] },
  { id: 'hires', label: 'New Hires This Month', value: '24', change: 26.3, changeNote: 'vs last month', tone: 'purple', icon: 'briefcase', sparkline: [4, 6, 5, 9, 7, 11, 8, 13, 12, 15] },
  { id: 'open', label: 'Open Positions', value: '36', change: -5.2, changeNote: 'vs last month', tone: 'orange', icon: 'calendar', sparkline: [30, 28, 31, 29, 33, 32, 30, 31, 29, 27] },
  { id: 'tenure', label: 'Avg. Tenure', value: '2.7 Years', change: 4.1, changeNote: 'vs last month', tone: 'blue', icon: 'trend', sparkline: [2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.6, 2.6, 2.7, 2.7] },
];

const EMPLOYEES: Employee[] = [
  { id: 'e1', employeeId: 'EMP-1001', name: 'Tobi Adewale', role: 'Finance Manager', department: 'Finance', location: 'Lagos, Nigeria', status: 'Active', tenure: '3.2 yrs', email: 'tobi.adewale@officeroom.com', initials: 'TA', tone: 'blue' },
  { id: 'e2', employeeId: 'EMP-1002', name: 'Mary Okoro', role: 'HR Business Partner', department: 'Human Resources', location: 'Abuja, Nigeria', status: 'Active', tenure: '2.8 yrs', email: 'mary.okoro@officeroom.com', initials: 'MO', tone: 'purple' },
  { id: 'e3', employeeId: 'EMP-1003', name: 'John Smith', role: 'Head of Operations', department: 'Operations', location: 'Lagos, Nigeria', status: 'Active', tenure: '4.5 yrs', email: 'john.smith@officeroom.com', initials: 'JS', tone: 'green' },
  { id: 'e4', employeeId: 'EMP-1004', name: 'Aisha Bello', role: 'Senior Analyst', department: 'Finance', location: 'Lagos, Nigeria', status: 'Active', tenure: '1.9 yrs', email: 'aisha.bello@officeroom.com', initials: 'AB', tone: 'orange' },
  { id: 'e5', employeeId: 'EMP-1005', name: 'Emeka Johnson', role: 'IT Administrator', department: 'Information Technology', location: 'Port Harcourt, Nigeria', status: 'Active', tenure: '2.3 yrs', email: 'emeka.johnson@officeroom.com', initials: 'EJ', tone: 'blue' },
  { id: 'e6', employeeId: 'EMP-1006', name: 'Tomi Salami', role: 'Sales Manager', department: 'Sales', location: 'Lagos, Nigeria', status: 'Active', tenure: '3.6 yrs', email: 'tomi.salami@officeroom.com', initials: 'TS', tone: 'green' },
  { id: 'e7', employeeId: 'EMP-1007', name: 'Grace Williams', role: 'Marketing Specialist', department: 'Marketing', location: 'Abuja, Nigeria', status: 'On Leave', tenure: '1.4 yrs', email: 'grace.williams@officeroom.com', initials: 'GW', tone: 'purple' },
  { id: 'e8', employeeId: 'EMP-1008', name: 'David Chen', role: 'Product Designer', department: 'Product', location: 'Lagos, Nigeria', status: 'Active', tenure: '2.1 yrs', email: 'david.chen@officeroom.com', initials: 'DC', tone: 'orange' },
];

const PEOPLE_ANALYTICS: PeopleAnalytics = {
  gender: [
    { label: 'Male', value: 773, percent: 62, tone: 'blue', count: 773 },
    { label: 'Female', value: 448, percent: 36, tone: 'purple', count: 448 },
    { label: 'Non-binary', value: 27, percent: 2, tone: 'teal', count: 27 },
  ],
  departments: [
    { label: 'Finance', value: 22, percent: 22, tone: 'blue' },
    { label: 'Operations', value: 20, percent: 20, tone: 'blue' },
    { label: 'HR', value: 18, percent: 18, tone: 'blue' },
    { label: 'Technology', value: 16, percent: 16, tone: 'blue' },
    { label: 'Sales', value: 14, percent: 14, tone: 'blue' },
    { label: 'Marketing', value: 10, percent: 10, tone: 'blue' },
  ],
};

const TIME_OFF: TimeOffRequest[] = [
  { id: 't1', name: 'Aisha Bello', type: 'Annual Leave', range: 'May 27 - May 31, 2025', days: 5, initials: 'AB', tone: 'orange' },
  { id: 't2', name: 'John Smith', type: 'Annual Leave', range: 'Jun 03 - Jun 07, 2025', days: 5, initials: 'JS', tone: 'green' },
  { id: 't3', name: 'Grace Williams', type: 'Sick Leave', range: 'Jun 10 - Jun 11, 2025', days: 2, initials: 'GW', tone: 'purple' },
];

const BIRTHDAYS: Birthday[] = [
  { id: 'b1', name: 'Tomi Salami', date: 'May 27', initials: 'TS', tone: 'green' },
  { id: 'b2', name: 'Mary Okoro', date: 'May 29', initials: 'MO', tone: 'purple' },
  { id: 'b3', name: 'Emeka Johnson', date: 'May 31', initials: 'EJ', tone: 'blue' },
  { id: 'b4', name: 'Aisha Bello', date: 'Jun 02', initials: 'AB', tone: 'orange' },
];

const TEAMS: Team[] = [
  { id: 'tm1', name: 'Finance Team', members: 128, openPositions: 8, activity: 78, tone: 'blue', extraAvatars: 3, avatarInitials: ['TA', 'AB', 'MO', 'JS'] },
  { id: 'tm2', name: 'HR Team', members: 96, openPositions: 5, activity: 64, tone: 'green', extraAvatars: 2, avatarInitials: ['MO', 'GW', 'TS', 'DC'] },
  { id: 'tm3', name: 'Operations Team', members: 112, openPositions: 6, activity: 72, tone: 'purple', extraAvatars: 4, avatarInitials: ['JS', 'EJ', 'TA', 'AB'] },
  { id: 'tm4', name: 'Sales Team', members: 84, openPositions: 7, activity: 68, tone: 'orange', extraAvatars: 2, avatarInitials: ['TS', 'DC', 'GW', 'MO'] },
];

const PEOPLE_SIDEBAR: SidebarSection[] = [
  {
    title: 'PEOPLE',
    links: [
      { label: 'Overview', to: '/people' },
      { label: 'Directory' },
      { label: 'Teams' },
      { label: 'Roles & Permissions' },
      { label: 'Skills & Competencies' },
      { label: 'Performance' },
      { label: 'Attendance' },
      { label: 'Time Off' },
      { label: 'Onboarding' },
      { label: 'Documents' },
      { label: 'Org Chart' },
    ],
  },
  {
    title: 'FAVORITES',
    links: [
      { label: 'Leadership Team' },
      { label: 'Active Employees' },
      { label: 'New Hires' },
      { label: 'Birthdays' },
      { label: 'Work Anniversaries' },
    ],
  },
];

const WORKBOOK_ROWS: Workbook['rows'] = [
  { metric: 'Total Revenue', actual: '120,000,000', target: '110,000,000', varianceN: '10,000,000', variancePct: '9.09%', status: 'Favorable', comment: 'Above target' },
  { metric: 'Gross Profit', actual: '60,000,000', target: '55,000,000', varianceN: '5,000,000', variancePct: '9.09%', status: 'Favorable', comment: 'Strong performance' },
  { metric: 'Operating Expenses', actual: '45,000,000', target: '42,000,000', varianceN: '-3,000,000', variancePct: '-7.14%', status: 'Unfavorable', comment: 'Monitor closely' },
  { metric: 'Operating Profit', actual: '15,000,000', target: '13,000,000', varianceN: '2,000,000', variancePct: '15.38%', status: 'Favorable', comment: 'Good improvement' },
  { metric: 'Net Profit', actual: '11,000,000', target: '9,500,000', varianceN: '1,500,000', variancePct: '15.79%', status: 'Favorable', comment: 'On track' },
  { metric: 'Cash Balance', actual: '35,500,000', target: '30,000,000', varianceN: '5,500,000', variancePct: '18.33%', status: 'Favorable', comment: 'Healthy balance' },
  { metric: 'Receivables', actual: '22,000,000', target: '20,000,000', varianceN: '2,000,000', variancePct: '10.00%', status: 'Favorable', comment: 'Within normal range' },
  { metric: 'Payables', actual: '12,500,000', target: '15,000,000', varianceN: '-2,500,000', variancePct: '-16.67%', status: 'Favorable', comment: 'Better control' },
  { metric: 'Projects Completed', actual: '8', target: '6', varianceN: '2', variancePct: '33.33%', status: 'Favorable', comment: 'Ahead of plan' },
  { metric: 'Open Issues', actual: '5', target: '8', varianceN: '-3', variancePct: '-37.50%', status: 'Favorable', comment: 'Good reduction' },
];

const DOC_PREVIEW: DocumentPreview = {
  name: 'Q2_Financials.docx',
  title: 'Q2 FINANCIAL REPORT',
  subtitle: 'April 1 - June 30, 2025',
  sections: [
    { heading: 'Executive Summary', body: 'The company recorded strong growth across all key financial indicators. Revenue increased by 18.6% compared to the previous quarter, driven by higher sales and operational efficiencies.' },
    { heading: 'Key Highlights', body: '' },
  ],
  words: 1234,
};

const PDF_PREVIEW: PdfPreview = {
  name: 'Budget_Analysis.pdf',
  title: 'BUDGET ANALYSIS',
  date: 'May 24, 2025',
  overview: 'This analysis compares actual performance against budgeted targets across all departments.',
  page: 1,
  pageCount: 24,
  zoom: 110,
  totalBudget: 'N92.0M',
  donut: [
    { label: 'Sales', value: 35, percent: 35, tone: 'blue' },
    { label: 'Marketing', value: 20, percent: 20, tone: 'purple' },
    { label: 'Operations', value: 20, percent: 20, tone: 'amber' },
    { label: 'IT & Software', value: 15, percent: 15, tone: 'green' },
    { label: 'Others', value: 10, percent: 10, tone: 'indigo' },
  ],
};

const DATA_STATS: DataStat[] = [
  { id: 'files', label: 'Total Files', value: '24,842', change: 18.6, changeNote: 'vs last month', tone: 'blue', icon: 'files', sparkline: [20, 22, 21, 25, 24, 28, 27, 31, 30, 34] },
  { id: 'datasets', label: 'Datasets', value: '842', change: 14.3, changeNote: 'vs last month', tone: 'purple', icon: 'database', sparkline: [10, 12, 11, 14, 13, 15, 16, 18, 17, 19] },
  { id: 'tables', label: 'Tables', value: '3,421', change: 21.7, changeNote: 'vs last month', tone: 'teal', icon: 'table', sparkline: [14, 16, 15, 19, 18, 21, 23, 22, 26, 28] },
  { id: 'sources', label: 'Data Sources', value: '28', change: 12.5, changeNote: 'vs last month', tone: 'orange', icon: 'source', sparkline: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9] },
  { id: 'storage', label: 'Storage Used', value: '7.8 TB', change: 8.4, changeNote: 'vs last month', tone: 'blue', icon: 'storage', sparkline: [5, 6, 6, 7, 7, 7.5, 7.6, 7.7, 7.8, 7.8] },
];

const DATA_SOURCES: DataSource[] = [
  { id: 'ds1', name: 'Snowflake - Prod', kind: 'Data Warehouse', status: 'Healthy', tone: 'blue' },
  { id: 'ds2', name: 'PostgreSQL - HR DB', kind: 'Database', status: 'Healthy', tone: 'green' },
  { id: 'ds3', name: 'MySQL - Operations', kind: 'Database', status: 'Warning', tone: 'amber' },
  { id: 'ds4', name: 'Google BigQuery', kind: 'Data Warehouse', status: 'Healthy', tone: 'blue' },
  { id: 'ds5', name: 'AWS S3 - Data Lake', kind: 'Cloud Storage', status: 'Healthy', tone: 'orange' },
];

const DATA_INSIGHTS: DataInsights = {
  topGrowth: { label: 'last month', value: '+18.6%', bars: [30, 42, 36, 55, 48, 66, 72] },
  mostActive: { name: 'Finance Analytics', updates: 342, sparkline: [4, 6, 5, 8, 7, 10, 9, 12] },
  quality: { score: 92, label: 'Excellent' },
  duplicates: { count: 2341, note: 'Across 14 datasets', sparkline: [9, 8, 10, 7, 9, 6, 8, 5, 7, 6] },
};

const QUALITY_ALERTS: QualityAlert[] = [
  { id: 'q1', message: "Missing values in 'Order_Date' column", dataset: 'Sales_Orders_Dataset', time: '2h ago', severity: 'warning' },
  { id: 'q2', message: 'Duplicate records detected', dataset: 'Customer_Master_Data', time: '16h ago', severity: 'critical' },
  { id: 'q3', message: "Data type mismatch in 'Amount' column", dataset: 'Finance_Transactions', time: '1h ago', severity: 'warning' },
  { id: 'q4', message: 'Null values in required fields', dataset: 'HR_Employee_Details', time: '2h ago', severity: 'critical' },
];

const CATALOG: CatalogEntry[] = [
  { id: 'c1', name: 'Finance Analytics', description: 'Contains financial KPIs, revenue, expenses, and budget variance data.', owner: 'Tobi Adewale', tables: 24, records: '8.4M', updated: 'Today, 10:34 AM', avatars: 3, tone: 'blue' },
  { id: 'c2', name: 'HR Warehouse', description: 'Employee, payroll, recruitment and performance data.', owner: 'Mary Okoro', tables: 18, records: '5.7M', updated: 'Today, 09:15 AM', avatars: 2, tone: 'green' },
  { id: 'c3', name: 'Sales Analytics', description: 'Sales pipeline, opportunities, revenue and target data.', owner: 'Tomi Salami', tables: 15, records: '12.1M', updated: 'Yesterday, 04:10 PM', avatars: 4, tone: 'orange' },
  { id: 'c4', name: 'Operations Metrics', description: 'Operational KPIs, incidents, SLAs and performance data.', owner: 'Emeka Johnson', tables: 31, records: '3.2M', updated: 'May 23, 2025', avatars: 1, tone: 'purple' },
];

const DATA_SIDEBAR: SidebarSection[] = [
  {
    title: 'DATA',
    links: [
      { label: 'Overview', to: '/data' },
      { label: 'All Files' },
      { label: 'Datasets' },
      { label: 'Tables' },
      { label: 'Databases' },
      { label: 'Data Sources' },
      { label: 'Integrations' },
      { label: 'Data Quality' },
      { label: 'Data Lineage' },
      { label: 'Archive' },
    ],
  },
  {
    title: 'FAVORITES',
    links: [
      { label: 'Finance Datasets' },
      { label: 'HR Data Warehouse' },
      { label: 'Sales Performance' },
      { label: 'Operations Metrics' },
    ],
  },
];

const WORKSPACE_META: WorkspaceMeta = {
  name: 'Officeroom',
  plan: 'Enterprise Plan',
  tabs: ['Excel Editor', 'Document Editor', 'PDF Viewer', 'All Files', 'Data Sources'],
  fileTabs: [
    { name: 'Morning_Report.xlsx', kind: 'Excel' },
    { name: 'Q2_Financials.docx', kind: 'Document' },
    { name: 'Budget_Analysis.pdf', kind: 'PDF' },
    { name: 'HR_Headcount.csv', kind: 'CSV' },
  ],
};

const STORAGE: StorageInfo = { usedTb: 7.8, totalTb: 10, percent: 78 };

/** Filters a list of files by file kind (All/More return everything). */
function filterByKind(items: FileItem[], kind?: string): FileItem[] {
  if (!kind || kind === 'All' || kind === 'More') return items;
  return items.filter((f) => f.kind === kind);
}

/** In-memory mock. Keep method names identical to the real backend contract. */
export const mockApi: CoreApi = {
  getCurrentUser: () => delay(USER),

  getDashboardStats: () => delay(DASHBOARD_STATS),
  getWorkOverview: (range) => delay({ ...WORK_OVERVIEW, range }),
  listRecentFiles: (kind) => delay(filterByKind(RECENT_FILES, kind)),
  listWorkspaces: () => delay(WORKSPACES),
  getTaskStatus: () => delay(TASK_STATUS),
  listActivities: () => delay(ACTIVITIES),
  listAIActions: () => delay(AI_ACTIONS),

  getCopilotThread: () => delay(COPILOT_THREAD),
  sendCopilotMessage: (text) =>
    delay<ChatMessage>(
      {
        id: `m_${Date.now()}`,
        role: 'assistant',
        text: `Got it. Working on "${text}". I'll post the result here when it's ready.`,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      },
      600,
    ),

  getPeopleStats: () => delay(PEOPLE_STATS),
  listEmployees: (query: EmployeeQuery) => {
    const pageSize = query.pageSize ?? 8;
    const page = query.page ?? 1;
    const search = (query.search ?? '').trim().toLowerCase();
    const filtered = EMPLOYEES.filter((e) => {
      if (search && !`${e.name} ${e.role} ${e.department}`.toLowerCase().includes(search)) return false;
      if (query.department && e.department !== query.department) return false;
      if (query.location && !e.location.startsWith(query.location)) return false;
      if (query.status && e.status !== query.status) return false;
      return true;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const start = (page - 1) * pageSize;
    const result: EmployeePage = {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages,
    };
    return delay(result);
  },
  getPeopleAnalytics: () => delay(PEOPLE_ANALYTICS),
  listPeopleActivities: () => delay(PEOPLE_ACTIVITIES),
  listTimeOff: () => delay(TIME_OFF),
  listUpcomingBirthdays: () => delay(BIRTHDAYS),
  listTeams: () => delay(TEAMS),
  getPeopleSidebar: () => delay(PEOPLE_SIDEBAR),

  getWorkspaceMeta: () => delay(WORKSPACE_META),
  getWorkbook: (name) =>
    delay<Workbook>({
      name,
      title: 'MORNING REPORT',
      date: 'May 24, 2025',
      activeCell: 'C7',
      formula: '120,000,000',
      sheets: ['Summary', 'Revenue Analysis', 'Expense Analysis', 'Cash Flow', 'KPI Dashboard'],
      activeSheet: 'Summary',
      savedAgo: 'Workbook saved 2 mins ago',
      rows: WORKBOOK_ROWS,
    }),
  getDocumentPreview: () => delay(DOC_PREVIEW),
  getPdfPreview: () => delay(PDF_PREVIEW),
  listWorkspaceFiles: () => delay(WORKSPACE_FILES),

  getDataSidebar: () => delay(DATA_SIDEBAR),
  getStorage: () => delay(STORAGE),
  getDataStats: () => delay(DATA_STATS),
  listDataFiles: (kind) => delay(filterByKind(DATA_FILES, kind)),
  listDataSources: () => delay(DATA_SOURCES),
  getDataInsights: () => delay(DATA_INSIGHTS),
  listQualityAlerts: () => delay(QUALITY_ALERTS),
  listCatalog: () => delay(CATALOG),
};
