import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { DemoDataBanner } from "@/components/layout/demo-data-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-full">
        <Topbar />
        <DemoDataBanner />
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
