import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, Settings, LogOut } from "lucide-react";
import { authApi } from "@/src/api/auth";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.startsWith("/products/new")) return "Novo Produto";
    if (path.startsWith("/products/")) return "Editar Produto";
    if (path.startsWith("/products")) return "Produtos";
    if (path.startsWith("/sales/new")) return "Nova Venda (PDV)";
    if (path.startsWith("/sales")) return "Histórico de Vendas";
    if (path.startsWith("/settings/cashiers")) return "Gerenciar Caixas";
    if (path.startsWith("/settings/checkouts")) return "Gerenciar Checkouts";
    if (path.startsWith("/settings/categories")) return "Categorias";
    if (path.startsWith("/settings/payment-forms")) return "Formas de Pagamento";
    if (path.startsWith("/settings")) return "Configurações";
    return "VenderBem Stock";
  };

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
      await authApi.logout();
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 active:scale-95 transition"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="font-bold text-slate-100 text-lg tracking-tight leading-none">
            {getPageTitle()}
          </h1>
          <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
            VenderBem Mobile PWA
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 text-slate-400 hover:text-red-400 rounded-xl bg-slate-800/60 active:scale-95 transition"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
};
