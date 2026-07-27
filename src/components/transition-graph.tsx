"use client";

import Link from "next/link";
import * as React from "react";

export interface GraphNode {
  slug: string;
  title: string;
  opportunityScore: number;
  category: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  adjacent: "var(--chart-1)",
  ambitious: "var(--chart-7)",
  lower_risk: "var(--chart-3)",
  highest_paying: "var(--chart-4)",
  minimal_retraining: "var(--chart-6)",
  strongest_demand: "var(--chart-2)",
};

const CATEGORY_LABEL: Record<string, string> = {
  adjacent: "Adjacent",
  ambitious: "Ambitious",
  lower_risk: "Lower risk",
  highest_paying: "Highest paying",
  minimal_retraining: "Minimal retraining",
  strongest_demand: "Strongest demand",
};

export function TransitionGraph({ centerTitle, centerSlug, nodes }: { centerTitle: string; centerSlug: string; nodes: GraphNode[] }) {
  const size = 480;
  const center = size / 2;
  const radius = size * 0.36;
  const [hovered, setHovered] = React.useState<string | null>(null);

  const positioned = nodes.slice(0, 8).map((n, i) => {
    const angle = (i / Math.min(nodes.length, 8)) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  });

  const usedCategories = [...new Set(positioned.map((n) => n.category))];

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-h-[480px]" role="img" aria-label={`Career transitions from ${centerTitle}`}>
        {positioned.map((n) => (
          <line
            key={`line-${n.slug}`}
            x1={center}
            y1={center}
            x2={n.x}
            y2={n.y}
            stroke={hovered === n.slug ? (CATEGORY_COLOR[n.category] ?? "var(--muted-foreground)") : "var(--border)"}
            strokeWidth={hovered === n.slug ? 2 : 1}
          />
        ))}
        <circle cx={center} cy={center} r={44} className="fill-primary" />
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="fill-primary-foreground text-[11px] font-medium">
          <tspan x={center} dy="-2">
            {centerTitle.length > 18 ? `${centerTitle.slice(0, 16)}…` : centerTitle}
          </tspan>
        </text>
        {positioned.map((n) => (
          <g
            key={n.slug}
            onMouseEnter={() => setHovered(n.slug)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            <Link href={`/transitions/${centerSlug}/${n.slug}`}>
              <circle cx={n.x} cy={n.y} r={hovered === n.slug ? 34 : 30} fill={CATEGORY_COLOR[n.category] ?? "var(--muted-foreground)"} fillOpacity={0.9} />
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" className="fill-white text-[9.5px] font-medium select-none">
                {wrapLabel(n.title).map((line, i) => (
                  <tspan key={i} x={n.x} dy={i === 0 ? -2 : 10}>
                    {line}
                  </tspan>
                ))}
              </text>
            </Link>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {usedCategories.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full inline-block" style={{ backgroundColor: CATEGORY_COLOR[c] }} />
            {CATEGORY_LABEL[c] ?? c}
          </div>
        ))}
      </div>
    </div>
  );
}

function wrapLabel(title: string): string[] {
  const words = title.split(" ");
  if (words.length <= 2) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
