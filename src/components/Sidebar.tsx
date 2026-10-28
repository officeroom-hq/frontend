import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { SidebarSection } from '../api/types';

/** Left rail: sections of links. Links with a `to` route to that page, others are placeholders. */
export function Sidebar({ sections, footer, className = '' }: { sections: SidebarSection[]; footer?: ReactNode; className?: string }) {
  return (
    <aside className={`flex w-full min-w-0 shrink-0 flex-col gap-4 border-b border-r-0 border-line bg-white px-2.5 py-3 md:w-40 md:border-b-0 md:border-r md:py-4 ${className}`}>
      {sections.map((s) => (
        <div key={s.title ?? 'section'}>
          {s.title && <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted">{s.title}</p>}
          <ul className="space-y-0.5">
            {s.links.map((l) => {
              const cls = 'flex items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50';
              const body = (
                <>
                  <span>{l.label}</span>
                  {l.count !== undefined && <span className="text-[9px] text-muted">{l.count}</span>}
                </>
              );
              return (
                <li key={l.label}>
                  {l.to ? (
                    <NavLink to={l.to} end className={({ isActive }) => `${cls} ${isActive ? 'bg-blue-50 font-medium text-blue-700' : ''}`}>
                      {body}
                    </NavLink>
                  ) : (
                    <span className={cls}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </aside>
  );
}
