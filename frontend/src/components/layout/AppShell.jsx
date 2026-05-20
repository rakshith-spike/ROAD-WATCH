import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

export function AppShell() {
  return (
    <div className="app-background">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-3 py-3 sm:px-5">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <TopNavbar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
