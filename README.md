# Officeroom frontend

React 18 + TypeScript + Vite + Tailwind CSS + React Router. All data comes from a mocked API layer in `src/api`, so a REST backend can replace it without touching components.

## Run

    npm install
    npm run dev       # dev server
    npm run build     # tsc + vite build
    npm run lint      # eslint

Dev-only role switcher (bottom corner) changes the signed-in persona between Owner, Admin, Manager and Member. It is stripped from production builds.

## Layout

    src/api/           API contract (types.ts), mock implementation, http client, single entry point index.ts
    src/components/ui/ design tokens in tailwind.config.js; shared primitives (Button, Field, Modal, Dropdown, Tabs, DataTable, Card, StatusChip, AIInsightCard, states)
    src/features/      auth, setup-wizard, dashboard, files, departments, audit, messaging
    src/lib/           permissions (role to capability map), session, validation, format, tones
    src/layouts/       AppLayout (top nav), SidebarLayout (page with left rail)

Swapping the backend: `src/api/index.ts` exports `api`. Switch it from the mock implementation to `createHttpApi()` in `src/api/client.ts`. Components do not change.

## Conventions for the REST backend

- JSON over HTTPS. Base URL from `VITE_API_BASE_URL`.
- Auth: `Authorization: Bearer <token>` on every call except sign-in, register and password reset.
- Ids are UUIDs.
- Errors: non-2xx with JSON `{ "message": string, "code": string }`. The client surfaces `message`.
- Money is in kobo or naira as a number; the UI formats it as ₦.

## Endpoints by page

Auth (`src/features/auth`)
- Sign in: POST /auth/login, body { email, password }, returns User plus token.
- Register: POST /auth/register, body { fullName, email, password, businessName }.
- Forgot password: POST /auth/password-reset, body { email }. Always 202 to avoid account enumeration.
- Current user: GET /me.

Setup wizard (`src/features/setup-wizard`)
- Business profile: GET /business.
- Generate plan: POST /setup/plan, body SetupInput { business, teamSize, departments, goals }, returns WorkspacePlan.
- Accept plan: POST /setup/plan/accept, body WorkspacePlan (after user edits), returns { workspaceId }.

Dashboard (`src/features/dashboard`)
- Stats: GET /dashboard/stats.
- Work overview: GET /dashboard/overview?range=This%20Week.
- Recent files: GET /files/recent?kind=Excel.
- Workspaces: GET /workspaces.
- Task status: GET /dashboard/tasks.
- Activity: GET /activity.
- AI actions: GET /ai/actions.
- Copilot thread: GET /ai/copilot/thread. Send: POST /ai/copilot/messages.

Files (`src/features/files`)
- Folder tree: GET /folders.
- Files in folder: GET /folders/{folderId}/files.
- File detail: GET /files/{fileId}.
- Upload: POST /folders/{folderId}/files, multipart/form-data, with upload progress from XHR upload events.

Departments and admin (`src/features/departments`)
- Departments: GET /departments.
- Members: GET /members?departmentId={id}.
- Permission matrix: GET /roles/permissions.
- Invite: POST /members/invitations, body { fullName, email, role, departmentId }.

Audit log (`src/features/audit`)
- Events: GET /audit/events?search=&category=&outcome=&sinceDays=.

Messaging (`src/features/messaging`)
- Channels: GET /channels.
- Messages: GET /channels/{channelId}/messages.
- Send: POST /channels/{channelId}/messages, body { text }.

Other pages still on the shared mock layer (People, Workspace, Data Center):
- People: GET /people/stats, GET /people/employees?search=&department=&page=, GET /people/analytics, GET /people/time-off, GET /people/birthdays, GET /teams.
- Workspace: GET /workspace/meta, GET /workspace/files, GET /workspace/workbooks/{name}, GET /workspace/documents/{name}, GET /workspace/pdfs/{name}.
- Data Center: GET /data/storage, GET /data/stats, GET /data/files, GET /data/sources, GET /data/insights, GET /data/quality-alerts, GET /data/catalog.

Business profile is the source for sector, city, state and size (GET /business).

## Roles

Owner, Admin, Manager, Member. Capabilities are defined in `src/lib/permissions.ts`. The server must enforce the same rules; the UI only hides what the role cannot do.

## Notes

- AI features are passive: insight cards, inline suggestions and sparkle icons. No chat takeover.
- Sample data is Nigerian: Adeola Spices & Foods Ltd, Lagos and Abuja, amounts in ₦.
