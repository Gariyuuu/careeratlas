"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface SalaryTrendPoint {
  label: string;
  historical?: number;
  conservative?: number;
  expected?: number;
  aggressive?: number;
}

const fmt = (v: number) => `$${Math.round(v / 1000)}k`;

export function SalaryTrendChart({ data }: { data: SalaryTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="historical" name="Historical" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="conservative" name="Conservative" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls />
        <Line type="monotone" dataKey="expected" name="Expected" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls />
        <Line type="monotone" dataKey="aggressive" name="Aggressive" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
