import Link from "next/link";
import { LineChart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LineChart className="size-4.5" />
        </div>
        <span className="font-semibold tracking-tight">CareerAtlas</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
