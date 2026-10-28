import type { ReactNode } from 'react';
import type { FileKind, FileStatus, AIActionStatus, Tone } from '../../api/types';
import { TONE_AVATAR, TONE_HEX } from '../../lib/tones';

export { Button, IconButton, type ButtonProps } from './button';
export { Input, Select, Textarea, SearchInput, Field } from './field';
export { Modal } from './modal';
export { Dropdown, type DropdownOption } from './dropdown';
export { Tabs, type TabItem } from './tabs';
export { LoadingState, EmptyState, ErrorState, AccessDenied, FormAlert } from './states';
export { AIInsightCard, InlineSuggestion, SparkleIcon } from './ai';
export { PageHeader } from './page';
export { DataTable, type Column } from './DataTable';
export { StatCard } from './StatCard';
export { Sparkline } from './Sparkline';
export { DonutChart } from './DonutChart';
export { METRIC_ICON } from './icons';

export type ChipTone = Tone | 'slate';

const CHIP: Record<ChipTone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatusChip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${CHIP[tone]}`}>
      {children}
    </span>
  );
}

export function fileStatusTone(s: FileStatus): ChipTone {
  if (s === 'Edited') return 'green';
  if (s === 'Analyzed') return 'purple';
  return 'slate';
}

export function aiStatusTone(s: AIActionStatus): ChipTone {
  if (s === 'Completed') return 'green';
  if (s === 'In Progress') return 'blue';
  return 'slate';
}

const KIND_TILE: Record<FileKind, { cls: string; label: string }> = {
  Excel: { cls: 'bg-green-100 text-green-700', label: 'X' },
  Document: { cls: 'bg-blue-100 text-blue-700', label: 'D' },
  Word: { cls: 'bg-blue-100 text-blue-700', label: 'W' },
  PDF: { cls: 'bg-red-100 text-red-600', label: 'P' },
  CSV: { cls: 'bg-teal-100 text-teal-700', label: 'C' },
  PowerPoint: { cls: 'bg-orange-100 text-orange-600', label: 'S' },
};

export function FileKindIcon({ kind }: { kind: FileKind }) {
  const t = KIND_TILE[kind];
  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold ${t.cls}`} aria-hidden="true">
      {t.label}
    </span>
  );
}

export function Card({
  title,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white shadow-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className={`px-4 pb-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function ViewAll({ label = 'View all' }: { label?: string }) {
  return (
    <button type="button" className="whitespace-nowrap text-[11px] font-medium text-blue-600 hover:underline">
      {label} →
    </button>
  );
}

export function PillFilter<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button
          key={it}
          role="tab"
          aria-selected={it === value}
          type="button"
          onClick={() => onChange(it)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${it === value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
}

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function ErrorNote({ error }: { error: Error }) {
  return <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">Could not load: {error.message}</p>;
}

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: Tone }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: TONE_HEX[tone] }} />
    </div>
  );
}

export function Avatar({ initials, tone = 'blue', size = 24 }: { initials: string; tone?: Tone; size?: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${TONE_AVATAR[tone]}`}
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.38) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ initials, extra = 0 }: { initials: string[]; extra?: number }) {
  const tones: Tone[] = ['blue', 'green', 'purple', 'orange', 'teal'];
  return (
    <div className="flex items-center">
      {initials.map((i, idx) => (
        <span key={i + idx} className="-ml-1.5 first:ml-0">
          <span className="ring-2 ring-white rounded-full inline-block">
            <Avatar initials={i} tone={tones[idx % tones.length]} size={22} />
          </span>
        </span>
      ))}
      {extra > 0 && <span className="-ml-1.5 flex h-[22px] items-center rounded-full bg-slate-100 px-1.5 text-[9px] font-medium text-slate-600 ring-2 ring-white">+{extra}</span>}
    </div>
  );
}
