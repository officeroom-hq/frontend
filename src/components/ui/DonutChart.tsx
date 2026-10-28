import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { Tone } from '../../api/types';
import { TONE_HEX } from '../../lib/tones';

export interface DonutDatum {
  label: string;
  value: number;
  tone: Tone | 'indigo';
}

/** Donut chart with optional centre label. Colours come from the shared tone palette. */
export function DonutChart({
  data,
  size = 120,
  innerRadius = 38,
  outerRadius = 56,
  centerTop,
  centerBottom,
}: {
  data: DonutDatum[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.label} fill={TONE_HEX[d.tone]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerTop || centerBottom) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerTop && <span className="text-sm font-semibold text-ink">{centerTop}</span>}
          {centerBottom && <span className="text-[10px] text-muted">{centerBottom}</span>}
        </div>
      )}
    </div>
  );
}
