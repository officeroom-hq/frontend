import { useSession } from '../lib/session';
import { ROLES } from '../lib/permissions';
import type { Role } from '../api/types';

/** Dev-only role switcher. Renders nothing in production builds. */
export function DevRoleSwitcher() {
  const { role, setRole } = useSession();
  if (!import.meta.env.DEV) return null;
  return (
    <label className="ml-1 flex items-center gap-1 rounded-md bg-amber-300/20 px-1.5 py-0.5 text-[10px] text-amber-100">
      <span className="font-semibold uppercase tracking-wide">Dev</span>
      <span className="sr-only">Switch role</span>
      <select
        aria-label="Switch role (dev only)"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded bg-transparent text-[10px] text-white focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="text-ink">{r}</option>
        ))}
      </select>
    </label>
  );
}
