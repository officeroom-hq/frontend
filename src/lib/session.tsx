import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Role, User } from '../api/types';
import { can, type Capability } from './permissions';

/** Dev-only personas for the role switcher. Sample data, Lagos/Abuja. */
export const DEV_PERSONAS: Record<Role, User> = {
  Owner: { id: '11111111-1111-4111-8111-000000000001', fullName: 'Chinedu Okafor', email: 'chinedu@adeolaspices.ng', initials: 'CO', role: 'Owner', tone: 'blue', location: 'Lagos, Nigeria' },
  Admin: { id: '11111111-1111-4111-8111-000000000002', fullName: 'Ngozi Eze', email: 'ngozi@adeolaspices.ng', initials: 'NE', role: 'Admin', tone: 'purple', location: 'Lagos, Nigeria' },
  Manager: { id: '11111111-1111-4111-8111-000000000003', fullName: 'Tobi Adewale', email: 'tobi@adeolaspices.ng', initials: 'TA', role: 'Manager', tone: 'green', location: 'Lagos, Nigeria' },
  Member: { id: '11111111-1111-4111-8111-000000000004', fullName: 'Aisha Bello', email: 'aisha@adeolaspices.ng', initials: 'AB', role: 'Member', tone: 'orange', location: 'Abuja, Nigeria' },
};

interface SessionValue {
  user: User;
  role: Role;
  setRole: (r: Role) => void;
  can: (c: Capability) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

/** Holds the signed-in user. The role switcher is shown only in dev builds (see DevRoleSwitcher). */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Owner');
  const value = useMemo<SessionValue>(
    () => ({ user: DEV_PERSONAS[role], role, setRole, can: (c) => can(role, c) }),
    [role],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
