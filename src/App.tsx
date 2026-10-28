import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireCapability } from './components/RequireCapability';
import DashboardPage from './features/dashboard/DashboardPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './features/auth/AuthPages';
import { SetupWizardPage } from './features/setup-wizard/SetupWizardPage';
import { FilesPage } from './features/files/FilesPage';
import { DepartmentsPage } from './features/departments/DepartmentsPage';
import { AuditPage } from './features/audit/AuditPage';
import { MessagingPage } from './features/messaging/MessagingPage';
import PeoplePage from './pages/PeoplePage';
import WorkspacePage from './pages/WorkspacePage';
import DataCenterPage from './pages/DataCenterPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/setup" element={<SetupWizardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/files" element={<RequireCapability capability="files:view"><FilesPage /></RequireCapability>} />
      <Route path="/admin" element={<RequireCapability capability="departments:view"><DepartmentsPage /></RequireCapability>} />
      <Route path="/audit" element={<RequireCapability capability="audit:view"><AuditPage /></RequireCapability>} />
      <Route path="/messages" element={<RequireCapability capability="messages:view"><MessagingPage /></RequireCapability>} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/data" element={<DataCenterPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
