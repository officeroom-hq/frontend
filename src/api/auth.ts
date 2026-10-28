import type { Role, Tone, User } from './types';
import { request, setAccessToken } from './client';

/** Backend user shape from the Tier 1 contract (User schema). */
interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  department_id: string | null;
  branch_id: string | null;
  staff_id: string;
  avatar_url: string | null;
  is_active: boolean;
}

type BackendRole = 'hq_super_admin' | 'hq_admin' | 'branch_manager' | 'department_manager' | 'branch_it_admin' | 'staff' | 'guest';

/** Backend roles mapped onto the UI roles. Unmapped or ambiguous roles fall to the least-privileged UI role. */
const ROLE_MAP: Record<BackendRole, Role> = {
  hq_super_admin: 'Owner',
  hq_admin: 'Admin',
  branch_manager: 'Manager',
  department_manager: 'Manager',
  branch_it_admin: 'Manager',
  staff: 'Member',
  guest: 'Member',
};

const TONE_MAP: Record<Role, Tone> = { Owner: 'blue', Admin: 'purple', Manager: 'green', Member: 'orange' };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return letters || '?';
}

export function toUser(u: ApiUser): User {
  const role = ROLE_MAP[u.role] ?? 'Member';
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    initials: initialsOf(u.name),
    role,
    tone: TONE_MAP[role],
    departmentId: u.department_id ?? undefined,
    location: '',
  };
}

/** Real auth endpoints: /auth/login, /auth/register, /auth/logout, /auth/password/forgot, /auth/password/reset. */
export const authApi = {
  async signIn(email: string, password: string): Promise<User> {
    const data = await request<{ token: string; user: ApiUser }>('POST', '/auth/login', { email, password });
    setAccessToken(data.token);
    return toUser(data.user);
  },

  async register(input: { fullName: string; email: string; password: string; businessName: string; industry: string }): Promise<User> {
    const data = await request<{ token: string; user: ApiUser }>('POST', '/auth/register', {
      organization_name: input.businessName,
      industry: input.industry,
      name: input.fullName,
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
    });
    setAccessToken(data.token);
    return toUser(data.user);
  },

  async logout(): Promise<void> {
    try {
      await request<void>('POST', '/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await request<void>('POST', '/auth/password/forgot', { email });
  },

  async resetPassword(input: { token: string; email: string; password: string }): Promise<void> {
    await request<void>('POST', '/auth/password/reset', {
      token: input.token,
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
    });
  },
};

/** GET /auth/me. Used to hydrate the session on load. */
export async function currentUser(): Promise<User> {
  const data = await request<{ user: ApiUser }>('GET', '/auth/me');
  return toUser(data.user);
}
