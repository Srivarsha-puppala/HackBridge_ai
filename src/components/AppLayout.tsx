import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 flex items-center border-b border-border/50 px-4 bg-card/30 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-primary" />
          </header>
          <main className="flex-1 p-6 overflow-auto cyber-grid">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
