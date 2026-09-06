/**
 * A sparkline, not a chart: no axes, no legend, no tooltip. It answers
 * "which way has this been going" at a glance and nothing else.
 *
 * Stroke spec lives in the numerics layer (`.spark-line`), so every sparkline
 * in the family is the same weight and the same direction colours.
 *
 * Accessibility: an <svg role="img"> with a <title> is announced as one
 * object. The numbers themselves must still be reachable somewhere on the
 * page -- a sparkline is a summary of a series, never its only presentation.
 */
export function Sparkline({
  values,
  width = 96,
  height = 24,
  label,
  invert = false,
  showDot = true,
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  label: string;
  invert?: boolean;
  showDot?: boolean;
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series has zero range; dividing by it puts every point at NaN.
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  // Inset by the stroke's half-width so the line is not clipped at the edges.
  const pad = 1.5;
  const usable = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = pad + usable - ((v - min) / range) * usable;
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  const net = values[values.length - 1] - values[0];
  const dir = net === 0 ? "flat" : (invert ? net < 0 : net > 0) ? "up" : "down";
  const [lastX, lastY] = pts[pts.length - 1];

  return (
    <svg
      className={`spark ${className ?? ""}`}
      data-dir={dir}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <path className="spark-area" d={area} />
      <path className="spark-line" d={line} />
      {/* r is also a presentation attribute so the dot survives if the
          CSS geometry property is unavailable; CSS wins where both apply. */}
      {showDot && <circle className="spark-dot" cx={lastX} cy={lastY} r={2.5} />}
    </svg>
  );
}
