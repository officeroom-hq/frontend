import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Lock } from 'lucide-react';
import { Button } from './button';

/** Shared loading, empty, error and access-denied states. Same tone as the dashboard cards. */
export function LoadingState({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-2 py-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-muted">{icon ?? <Inbox size={16} aria-hidden="true" />}</span>
      <p className="text-[12px] font-semibold text-ink">{title}</p>
      {body && <p className="max-w-xs text-[11px] text-muted">{body}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-control bg-red-50 px-3 py-2 ring-1 ring-inset ring-red-200">
      <p className="flex items-center gap-2 text-[11px] text-red-700">
        <AlertTriangle size={13} aria-hidden="true" />
        Could not load: {error.message}
      </p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function AccessDenied() {
  return (
    <EmptyState
      icon={<Lock size={16} aria-hidden="true" />}
      title="You do not have access to this page"
      body="Ask an Owner or Admin if you need it."
    />
  );
}


/** Inline form-level message: error (red) or success (green). Used by forms, never by data loads. */
export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'success'; children: ReactNode }) {
  const cls = tone === 'error' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-control px-3 py-2 text-[11px] ring-1 ring-inset ${cls}`}>
      {children}
    </p>
  );
}
