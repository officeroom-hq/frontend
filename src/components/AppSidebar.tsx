import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Capability } from '../lib/permissions';
import { useSession } from '../lib/session';

export interface AppSidebarLink {
  label: string;
  to: string;
  capability: Capability;
  icon: ReactNode;
  count?: number;
}

/**
 * Left rail for module pages. Links are filtered by the signed-in role:
 * a link the role cannot use is not rendered at all.
 */
export function AppSidebar({ links, title }: { links: AppSidebarLink[]; title?: string }) {
  const { can } = useSession();
  const visible = links.filter((l) => can(l.capability));
  return (
    <aside aria-label={title ?? 'Module navigation'} className="flex w-full shrink-0 flex-col gap-1 border-r border-line bg-white px-2.5 py-4 md:w-44">
      {title && <p className="px-2.5 pb-1.5 text-micro font-semibold uppercase tracking-wider text-muted">{title}</p>}
      <ul className="space-y-0.5">
        {visible.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                `flex items-center justify-between gap-2 rounded-control px-2.5 py-1.5 text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              <span className="flex items-center gap-2">
                {l.icon}
                {l.label}
              </span>
              {l.count !== undefined && <span className="text-micro text-muted">{l.count}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
