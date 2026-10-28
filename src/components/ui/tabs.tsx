import { useRef, type KeyboardEvent } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Underline tabs with arrow-key navigation (WAI-ARIA tabs pattern). */
export function Tabs<T extends string>({ items, value, onChange, label }: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((i) => i.value === value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(items[next].value);
      refs.current[items[next].value]?.focus();
    }
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className="flex gap-4 border-b border-line">
      {items.map((it) => {
        const selected = it.value === value;
        return (
          <button
            key={it.value}
            ref={(el) => { refs.current[it.value] = el; }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(it.value)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-0.5 pb-2 text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${selected ? 'border-blue-600 text-blue-700' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {it.label}
            {it.count !== undefined && <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-600">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
