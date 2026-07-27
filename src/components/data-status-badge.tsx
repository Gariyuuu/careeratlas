import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  reported: "Reported",
  estimated: "Estimated",
  forecast: "Forecast",
  simulated: "Simulated",
};

const STYLES: Record<string, string> = {
  reported: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-transparent",
  estimated: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-transparent",
  forecast: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-transparent",
  simulated: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-transparent",
};

export function DataStatusBadge({ status, className }: { status?: string | null; className?: string }) {
  if (!status) return null;
  return (
    <Badge className={cn("text-[10px] font-medium", STYLES[status] ?? "", className)}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
