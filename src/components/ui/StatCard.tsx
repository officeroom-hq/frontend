import type { Tone, StatMetric } from '../../api/types';
import { TONE_TILE } from '../../lib/tones';
import { METRIC_ICON } from './icons';
import { Sparkline } from './Sparkline';

export interface StatCardProps {
  label: string;
  value: string;
  change: number;
  changeNote: string;
  icon: StatMetric['icon'];
  tone: Tone;
  sparkline: number[];
  /** Show the change as a "down" metric when it is negative (open positions). */
  invertGood?: boolean;
}

/** KPI card: icon tile, label, big value, delta vs previous period, sparkline. */
export function StatCard({ label, value, change, changeNote, icon, tone, sparkline, invertGood = false }: StatCardProps) {
  const Icon = METRIC_ICON[icon];
  const isGood = invertGood ? change < 0 : change >= 0;
  const sign = change >= 0 ? '+' : '';
  const arrow = change >= 0 ? '↑' : '↓';
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-white p-3 shadow-card sm:gap-3 sm:p-3.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_TILE[tone]}`}>
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-tight text-ink">{value}</p>
        <p className={`mt-0.5 text-[10px] font-medium ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {arrow} {sign}
          {change.toFixed(1)}% <span className="font-normal text-muted">{changeNote}</span>
        </p>
      </div>
      <Sparkline data={sparkline} tone={tone} />
    </div>
  );
}
