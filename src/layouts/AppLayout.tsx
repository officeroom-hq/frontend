import type { ReactNode } from 'react';
import { TopNav } from '../components/TopNav';

/** Full-page shell: sticky top nav on a light grey canvas. Pages add their own sidebar and content. */
export function AppLayout({ children, searchPlaceholder }: { children: ReactNode; searchPlaceholder?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      <TopNav searchPlaceholder={searchPlaceholder} />
      {children}
    </div>
  );
}
