import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PWAPrompt } from "./PWAPrompt";

export const Layout: React.FC = () => {
  const location = useLocation();
  const isMainTab =
    location.pathname === "/products" ||
    location.pathname === "/sales" ||
    location.pathname === "/settings";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative border-x border-slate-800/40 shadow-2xl">
      <Header showBack={!isMainTab} />
      
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
      <PWAPrompt />
    </div>
  );
};
