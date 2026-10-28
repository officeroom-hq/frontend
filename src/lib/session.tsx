import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role, User } from '../api/types';
import { authApi, currentUser } from '../api/auth';
import { getAccessToken, setUnauthorizedHandler } from '../api/client';
import { can, type Capability } from './permissions';

/** Dev-only personas for the role switcher. Sample data, Lagos/Abuja. Used only in dev builds. */
export const DEV_PERSONAS: Record<Role, User> = {
  Owner: { id: '11111111-1111-4111-8111-000000000001', fullName: 'Chinedu Okafor', email: 'chinedu@adeolaspices.ng', initials: 'CO', role: 'Owner', tone: 'blue', location: 'Lagos, Nigeria' },
  Admin: { id: '11111111-1111-4111-8111-000000000002', fullName: 'Ngozi Eze', email: 'ngozi@adeolaspices.ng', initials: 'NE', role: 'Admin', tone: 'purple', location: 'Lagos, Nigeria' },
  Manager: { id: '11111111-1111-4111-8111-000000000003', fullName: 'Tobi Adewale', email: 'tobi@adeolaspices.ng', initials: 'TA', role: 'Manager', tone: 'green', location: 'Lagos, Nigeria' },
  Member: { id: '11111111-1111-4111-8111-000000000004', fullName: 'Aisha Bello', email: 'aisha@adeolaspices.ng', initials: 'AB', role: 'Member', tone: 'orange', location: 'Abuja, Nigeria' },
};

interface SessionValue {
  /** Signed-in user, or null when signed out. */
  user: User | null;
  /** True until the first /auth/me hydration finishes. */
  loading: boolean;
  role: Role;
  setRole: (r: Role) => void;
  can: (c: Capability) => boolean;
  /** Stores the signed-in user after login or register. */
  signedIn: (user: User) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Holds the signed-in user. On load it hydrates from /auth/me when a token is present.
 * A 401 signs the user out (see client.ts). The dev role switcher can override the role in dev builds only.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAccessToken()));
  const [devRole, setDevRole] = useState<Role | null>(null);

  const clear = useCallback(() => {
    setUser(null);
    setDevRole(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clear);
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    let active = true;
    currentUser()
      .then((u) => active && setUser(u))
      .catch(() => active && clear())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [clear]);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // the token is cleared locally even when the server call fails
    }
    clear();
  }, [clear]);

  const value = useMemo<SessionValue>(() => {
    const realRole: Role = user?.role ?? 'Member';
    const role: Role = import.meta.env.DEV && devRole ? devRole : realRole;
    return {
      user: import.meta.env.DEV && devRole && user ? { ...user, role: devRole } : user,
      loading,
      role,
      setRole: (r) => {
        if (import.meta.env.DEV) setDevRole(r);
      },
      can: (c) => can(role, c),
      signedIn: (u) => setUser(u),
      signOut,
    };
  }, [user, loading, devRole, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
