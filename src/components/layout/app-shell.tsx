import { Suspense } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { DemoModeBanner } from "@/components/layout/demo-mode-banner";
import { SignInBanner } from "@/components/layout/sign-in-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { TradesAuthSync } from "@/components/trades/trades-auth-sync";
import { TradesProvider } from "@/components/trades/trades-provider";
import type { Trade } from "@/types/database";

function SidebarFallback() {
  return <aside className="hidden w-[260px] shrink-0 border-r border-border lg:block" />;
}

export function AppShell({
  initialTrades,
  children,
}: {
  initialTrades: Trade[];
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <TradesProvider initialTrades={initialTrades}>
        <TradesAuthSync />
        <div className="flex min-h-screen bg-background">
          <Suspense fallback={<SidebarFallback />}>
            <Sidebar />
          </Suspense>
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <TopBar />
            <DemoModeBanner />
            <SignInBanner />
            <main className="flex-1 px-4 py-8 lg:px-10">{children}</main>
          </div>
        </div>
      </TradesProvider>
    </AuthProvider>
  );
}
