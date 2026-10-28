import type { ReactNode } from 'react';
import { Logo } from '../../components/TopNav';
import { CARD_CLASS } from '../../lib/styles';

/** Centred card on the page canvas. Same nav bar and card style as the app shell. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      <header className="flex h-12 items-center bg-nav px-4">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-10">
        <div className="w-full max-w-sm">
          <div className={`${CARD_CLASS} p-5`}>
            <h1 className="text-heading font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-0.5 text-body text-muted">{subtitle}</p>}
            <div className="mt-4 space-y-3">{children}</div>
          </div>
          {footer && <div className="mt-3 text-center text-caption text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
