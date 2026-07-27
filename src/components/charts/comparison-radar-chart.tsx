"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export interface RadarSeries {
  name: string;
  values: Record<string, number>; // 0-100 per axis
}

export function ComparisonRadarChart({ axes, series }: { axes: string[]; series: RadarSeries[] }) {
  const data = axes.map((axis) => {
    const point: Record<string, string | number> = { axis };
    for (const s of series) point[s.name] = s.values[axis] ?? 0;
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Radar key={s.name} name={s.name} dataKey={s.name} stroke={SERIES_COLORS[i % SERIES_COLORS.length]} fill={SERIES_COLORS[i % SERIES_COLORS.length]} fillOpacity={0.18} strokeWidth={2} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
