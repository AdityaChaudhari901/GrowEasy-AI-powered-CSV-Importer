import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { ImportWorkspace } from "@/features/import-leads/components/import-workspace";

export default function HomePage() {
  return (
    <Providers>
      <AppShell>
        <ImportWorkspace />
      </AppShell>
    </Providers>
  );
}
