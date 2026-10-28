import type { ReactNode } from 'react';
import { AppLayout } from './AppLayout';

/** Page with a left rail and a scrolling main column. Same padding as the dashboard. */
export function SidebarLayout({ sidebar, children, searchPlaceholder }: { sidebar?: ReactNode; children: ReactNode; searchPlaceholder?: string }) {
  return (
    <AppLayout searchPlaceholder={searchPlaceholder}>
      <div className="flex min-h-[calc(100vh-3rem)] min-w-0 flex-1 flex-col md:flex-row">
        {sidebar ?? null}
        <main className="min-w-0 max-w-full flex-1 space-y-4 px-3 pb-6 pt-4 sm:px-4 lg:px-6">{children}</main>
      </div>
    </AppLayout>
  );
}
