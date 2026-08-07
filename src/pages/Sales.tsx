import { saleApi } from "@/src/api/sale";
import { SaleDto } from "@/src/api/types";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Loader2,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await saleApi.getSales({
        limit: 50,
        sort: "-SaleDate",
      });
      setSales(res.data || []);
    } catch (err: any) {
      console.error("Error loading sales:", err);
      setErrorMsg("Não foi possível carregar o histórico de vendas.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Hoje";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Últimas Vendas Realizadas
        </h2>
        <button
          onClick={() => navigate("/sales/new")}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Nova Venda (PDV)
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </span>
          <button
            onClick={fetchSales}
            className="text-xs text-blue-400 underline font-semibold"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs">Carregando histórico de vendas...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            Nenhuma venda registrada
          </h3>
          <p className="text-xs text-slate-500">
            Abra uma nova venda no PDV Mobile para registrar seus pedidos.
          </p>
          <button
            onClick={() => navigate("/sales/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Iniciar Venda
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sales.map((sale, idx) => {
            const rawDate = sale.saleDate || sale.createdAt;
            const totalValue = sale.totalValue ?? sale.total ?? sale.totalAmount ?? 0;

            return (
              <div
                key={sale.id || idx}
                onClick={() =>
                  sale.id && navigate(`/sales/${sale.id}`, { state: { sale } })
                }
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm cursor-pointer active:scale-[0.99] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{formatDate(rawDate)}</span>
                  </div>

                  {(sale.clientName || sale.paymentFormName) && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {sale.clientName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-400" />
                          {sale.clientName}
                        </span>
                      )}
                      {sale.paymentFormName && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-400" />
                          {sale.paymentFormName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-emerald-400 block">
                    R${" "}
                    {Number(totalValue).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
