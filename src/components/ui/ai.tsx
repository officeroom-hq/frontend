import type { ReactNode } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from './button';

/** Subtle sparkle mark used next to any AI-produced content. */
export function SparkleIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return <Sparkles size={size} className={`text-accent ${className}`} aria-label="AI suggestion" role="img" />;
}

/**
 * AI insight card. Passive: it sits in a layout and offers one or two actions the user can take or dismiss.
 * Never takes over the screen and never opens a chat.
 */
export function AIInsightCard({ title, body, actions, onDismiss, footer, className = '' }: {
  title: string;
  body: ReactNode;
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }[];
  onDismiss?: () => void;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={`AI insight: ${title}`} className={`rounded-card border border-violet-100 bg-gradient-to-b from-violet-50/70 to-white p-3.5 shadow-card ${className}`}>
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100"><SparkleIcon size={11} /></span>
          <h3 className="text-[12px] font-semibold text-ink">{title}</h3>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss insight" className="rounded p-0.5 text-muted hover:bg-violet-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            <X size={12} />
          </button>
        )}
      </header>
      <div className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{body}</div>
      {actions && actions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {actions.map((a) => (
            <Button key={a.label} size="sm" variant={a.variant ?? 'secondary'} onClick={a.onClick}>{a.label}</Button>
          ))}
        </div>
      )}
      {footer && <div className="mt-2 text-[10px] text-muted">{footer}</div>}
    </section>
  );
}

/** Inline suggestion row for forms and tables: sparkle, one line of text, accept or dismiss. */
export function InlineSuggestion({ text, onAccept, onDismiss }: { text: string; onAccept?: () => void; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-control bg-violet-50/70 px-2.5 py-1.5 ring-1 ring-inset ring-violet-100">
      <p className="flex items-center gap-1.5 text-[11px] text-slate-700"><SparkleIcon />{text}</p>
      <div className="flex shrink-0 items-center gap-1">
        {onAccept && <Button size="sm" variant="secondary" onClick={onAccept}>Use</Button>}
        <button type="button" onClick={onDismiss} aria-label="Dismiss suggestion" className="rounded p-0.5 text-muted hover:text-ink"><X size={12} /></button>
      </div>
    </div>
  );
}
