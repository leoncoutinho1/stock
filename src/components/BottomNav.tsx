import React from "react";
import { NavLink } from "react-router-dom";
import { Package, ShoppingBag, Settings, PlusCircle } from "lucide-react";

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 flex items-center justify-around pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <NavLink
        to="/products"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
            isActive
              ? "text-blue-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`
        }
      >
        <Package className="w-5 h-5" />
        <span className="text-[11px]">Produtos</span>
      </NavLink>

      <NavLink
        to="/sales/new"
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 active:scale-95 transition">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] text-blue-400 font-semibold mt-0.5">PDV Venda</span>
      </NavLink>

      <NavLink
        to="/sales"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
            isActive
              ? "text-blue-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`
        }
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[11px]">Vendas</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
            isActive
              ? "text-blue-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span className="text-[11px]">Ajustes</span>
      </NavLink>
    </nav>
  );
};
