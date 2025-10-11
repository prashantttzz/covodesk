import AuthGuard from "@/provider/AuthGuard";
import OrgGuard from "@/provider/OrgGuard";
import React from "react";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { cookies } from "next/headers";
import DashboardSidebar from "@/components/Sidebar";
import { Provider } from "jotai";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <div className="w-full h-full min-w-screen min-h-screen">
      <AuthGuard>
        <OrgGuard>
          <Provider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <main className=" w-full h-full min-h-screen min-w-screen flex">
                <DashboardSidebar />
                {children}
              </main>
            </SidebarProvider>
          </Provider>
        </OrgGuard>
      </AuthGuard>
    </div>
  );
};

export default layout;
