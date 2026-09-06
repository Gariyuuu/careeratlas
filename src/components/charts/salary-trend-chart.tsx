"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AXIS_TICK, SERIES_DASH, TOOLTIP_STYLE, useChartAnimation } from "./chart-theme";

export interface SalaryTrendPoint {
  label: string;
  historical?: number;
  conservative?: number;
  expected?: number;
  aggressive?: number;
}

const fmt = (v: number) => `$${Math.round(v / 1000)}k`;

export function SalaryTrendChart({ data }: { data: SalaryTrendPoint[] }) {
  const animate = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fmt} tick={AXIS_TICK} tickLine={false} axisLine={false} width={52} />
        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {/* Three scenario lines previously shared one "4 3" dash, so only hue told
            them apart. Each now carries its own pattern. */}
        <Line type="monotone" dataKey="historical" name="Historical" stroke="var(--chart-1)" strokeWidth={2} strokeDasharray={SERIES_DASH[0]} dot={false} connectNulls isAnimationActive={animate} />
        <Line type="monotone" dataKey="conservative" name="Conservative" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray={SERIES_DASH[1]} dot={false} connectNulls isAnimationActive={animate} />
        <Line type="monotone" dataKey="expected" name="Expected" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray={SERIES_DASH[2]} dot={false} connectNulls isAnimationActive={animate} />
        <Line type="monotone" dataKey="aggressive" name="Aggressive" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray={SERIES_DASH[3]} dot={false} connectNulls isAnimationActive={animate} />
      </LineChart>
    </ResponsiveContainer>
  );
}
