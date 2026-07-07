import { MobileNavigation, Sidebar } from "./sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen w-full overflow-hidden bg-[var(--background)]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <MobileNavigation />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
