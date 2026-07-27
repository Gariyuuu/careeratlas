import { auth } from "@/lib/auth";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";

export async function Topbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex-1 max-w-xl">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu name={session?.user?.name} email={session?.user?.email} />
      </div>
    </header>
  );
}
