"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { AXIS_TICK, TOOLTIP_STYLE, useChartAnimation } from "./chart-theme";

export interface DistributionPoint {
  label: string;
  value: number;
}

const fmt = (v: number) => `$${Math.round(v / 1000)}k`;

export function SalaryDistributionChart({ data, highlightIndex }: { data: DistributionPoint[]; highlightIndex?: number }) {
  const animate = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fmt} tick={AXIS_TICK} tickLine={false} axisLine={false} width={52} />
        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={animate}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === highlightIndex ? "var(--chart-1)" : "var(--muted-foreground)"} fillOpacity={i === highlightIndex ? 1 : 0.35} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
