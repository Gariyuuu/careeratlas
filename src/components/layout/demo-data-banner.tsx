import { Info } from "lucide-react";

export function DemoDataBanner() {
  return (
    <div className="flex items-center gap-2 border-b bg-amber-50 dark:bg-amber-950/30 px-4 md:px-6 py-2 text-xs text-amber-900 dark:text-amber-200">
      <Info className="size-3.5 shrink-0" />
      <p>
        CareerAtlas is running on a deterministic <strong>simulated demo dataset</strong> — compensation, trend, and
        outcome figures illustrate the product but are not verified real-world data. See{" "}
        <a href="/methodology" className="underline underline-offset-2">
          Methodology
        </a>{" "}
        and{" "}
        <a href="/data-sources" className="underline underline-offset-2">
          Data Sources
        </a>{" "}
        for details.
      </p>
    </div>
  );
}
