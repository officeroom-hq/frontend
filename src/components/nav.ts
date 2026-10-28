import type { Capability } from '../lib/permissions';

export interface NavItem {
  label: string;
  to?: string;
  caret?: boolean;
  /** Hidden from the top nav when the role lacks this capability. */
  capability?: Capability;
}

/** Top nav. Items without `to` are placeholders for modules not yet built. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', capability: 'dashboard:view' },
  { label: 'Workspace', to: '/workspace', caret: true, capability: 'files:view' },
  { label: 'Files', to: '/files', capability: 'files:view' },
  { label: 'Messages', to: '/messages', capability: 'messages:view' },
  { label: 'Workflows' },
  { label: 'Reports' },
  { label: 'Data', to: '/data', capability: 'data:view' },
  { label: 'People', to: '/people', capability: 'people:view' },
  { label: 'Admin', to: '/admin', capability: 'departments:view' },
  { label: 'Audit', to: '/audit', capability: 'audit:view' },
  { label: 'Automations' },
];

export interface SidebarNavItem {
  label: string;
  to: string;
  icon?: string;
  capability: Capability;
}
