import type { Role } from '../api/types';

/** Ordered from most to least privileged. */
export const ROLES: readonly Role[] = ['Owner', 'Admin', 'Manager', 'Member'];

/** Every capability the UI gates on. Keep names stable; the backend should mirror them. */
export type Capability =
  | 'dashboard:view'
  | 'files:view'
  | 'files:upload'
  | 'messages:view'
  | 'people:view'
  | 'departments:view'
  | 'departments:manage'
  | 'members:invite'
  | 'roles:manage'
  | 'audit:view'
  | 'workspace:setup'
  | 'data:view';

const GRANTS: Record<Role, readonly Capability[]> = {
  Owner: [
    'dashboard:view', 'files:view', 'files:upload', 'messages:view', 'people:view', 'departments:view',
    'departments:manage', 'members:invite', 'roles:manage', 'audit:view', 'workspace:setup', 'data:view',
  ],
  Admin: [
    'dashboard:view', 'files:view', 'files:upload', 'messages:view', 'people:view', 'departments:view',
    'departments:manage', 'members:invite', 'audit:view', 'workspace:setup', 'data:view',
  ],
  Manager: ['dashboard:view', 'files:view', 'files:upload', 'messages:view', 'people:view', 'departments:view', 'data:view'],
  Member: ['dashboard:view', 'files:view', 'messages:view'],
};

export function can(role: Role, capability: Capability): boolean {
  return GRANTS[role].includes(capability);
}
