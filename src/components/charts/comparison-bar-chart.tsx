"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { AXIS_TICK, TOOLTIP_STYLE, useChartAnimation } from "./chart-theme";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const FORMATTERS: Record<string, (v: number) => string> = {
  currency: (v) => `$${Math.round(v / 1000)}k`,
  number: (v) => v.toLocaleString(),
};

export function ComparisonBarChart({
  data,
  bars,
  format = "number",
}: {
  data: Record<string, string | number>[];
  bars: { key: string; label: string }[];
  format?: "currency" | "number";
}) {
  const fmt = FORMATTERS[format];
  const animate = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fmt} tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} />
        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={animate} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
