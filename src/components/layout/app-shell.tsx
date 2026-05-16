import { Suspense } from "react";

import { DemoModeBanner } from "@/components/layout/demo-mode-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

function SidebarFallback() {
  return <aside className="hidden w-[260px] shrink-0 border-r border-border lg:block" />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <DemoModeBanner />
        <main className="flex-1 px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
