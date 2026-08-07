import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/src/contexts/ThemeContext";
import {
  Wallet,
  Monitor,
  Tag,
  CreditCard,
  Moon,
  Sun,
  Laptop,
  ChevronRight,
  Shield,
  Smartphone,
  LogOut,
} from "lucide-react";
import { authApi } from "@/src/api/auth";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    if (confirm("Deseja realmente encerrar a sessão?")) {
      await authApi.logout();
      navigate("/login");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* App Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg">
          VB
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-sm">VenderBem Stock PWA</h3>
          <p className="text-xs text-slate-400">Versão Web PWA Mobile 1.0.0</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 space-y-1">
        <div
          onClick={() => navigate("/settings/categories")}
          className="p-3 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-200">Categorias de Produtos</h4>
              <p className="text-[11px] text-slate-400">Organize seus itens por grupo</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => navigate("/settings/payment-forms")}
          className="p-3 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-200">Formas de Pagamento</h4>
              <p className="text-[11px] text-slate-400">Pix, Dinheiro, Cartão de Crédito/Débito</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => navigate("/settings/cashiers")}
          className="p-3 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-200">Gerenciar Caixas</h4>
              <p className="text-[11px] text-slate-400">Operadores e abertura/fechamento</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => navigate("/settings/checkouts")}
          className="p-3 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-200">Checkouts / Guichês</h4>
              <p className="text-[11px] text-slate-400">Terminais de venda cadastrados</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Theme Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aparência do Aplicativo</h4>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs ${
              theme === "dark"
                ? "bg-blue-600/20 border-blue-500 text-blue-400 font-semibold"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}
          >
            <Moon className="w-4 h-4" />
            Escuro
          </button>

          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs ${
              theme === "light"
                ? "bg-blue-600/20 border-blue-500 text-blue-400 font-semibold"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}
          >
            <Sun className="w-4 h-4" />
            Claro
          </button>

          <button
            onClick={() => setTheme("auto")}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs ${
              theme === "auto"
                ? "bg-blue-600/20 border-blue-500 text-blue-400 font-semibold"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}
          >
            <Laptop className="w-4 h-4" />
            Sistema
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
      >
        <LogOut className="w-4 h-4" /> Sair da Conta
      </button>
    </div>
  );
};
