import { saleApi } from "@/src/api/sale";
import {
  ArrowLeft,
  Barcode,
  Calendar,
  CheckCircle2,
  Loader2,
  Package,
  Receipt,
  ShoppingBag
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const SaleDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const initialSale = location.state?.sale || null;
  const [sale, setSale] = useState<any | null>(initialSale);
  const [loading, setLoading] = useState(!initialSale);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSaleDetail(id);
    }
  }, [id]);

  const loadSaleDetail = async (saleId: string) => {
    if (!initialSale) {
      setLoading(true);
    }
    setErrorMsg(null);
    try {
      const data = await saleApi.getSale(saleId);
      const saleData = data?.data || data;
      if (saleData && (saleData.id || saleData.saleProducts)) {
        setSale(saleData);
      }
    } catch (err: any) {
      console.error("Error loading sale detail:", err);
      if (!sale) {
        setErrorMsg("Não foi possível carregar os detalhes da venda.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Data não informada";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  if (loading && !sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs">Carregando detalhes da venda...</p>
      </div>
    );
  }

  if (errorMsg && !sale) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{errorMsg}</h3>
        <button
          onClick={() => navigate("/sales")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Vendas
        </button>
      </div>
    );
  }

  const rawDate = sale.saleDate ?? sale.createdAt;
  const totalVal = sale.totalValue ?? sale.total ?? sale.totalAmount ?? 0;
  const paidVal = sale.paidValue ?? totalVal;
  const changeVal = sale.changeValue ?? 0;
  const discountVal = sale.overallDiscount ?? 0;
  const items: any[] = sale.saleProducts || sale.items || sale.products || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>{formatDate(rawDate)}</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Venda Concluída
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Valor Total da Venda
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
              R${" "}
              {Number(totalVal).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {discountVal > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Desconto Aplicado
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                - R$ {Number(discountVal).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {(paidVal > 0 || changeVal > 0) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Valor Pago
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                R$ {Number(paidVal).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Troco</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                R$ {Number(changeVal).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Products Items List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Itens da Venda (
            {items.length})
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-1">
            <Package className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-1" />
            <p>Nenhum produto listado nesta venda.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {items.map((sp, idx) => {
              const productObj = sp.product || {};
              const prodDesc =
                productObj.description ||
                sp.productDescription ||
                sp.description ||
                `Produto #${sp.productId || idx + 1}`;

              const qty = sp.quantity ?? 1;
              const unitPrice = sp.unitPrice ?? productObj.price ?? 0;
              const itemDiscount = sp.discount ?? 0;
              const subTotal = qty * unitPrice - itemDiscount;

              const barcodeList = productObj.barcodes || [];
              const barcode =
                barcodeList[0] || productObj.mainBarcode || productObj.barCode;
              const unit = productObj.unit || "UN";

              return (
                <div
                  key={sp.productId || idx}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                      {prodDesc}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                        {qty} {unit} x R$ {Number(unitPrice).toFixed(2)}
                      </span>
                      {barcode && (
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                          {barcode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      R$ {Number(subTotal).toFixed(2)}
                    </span>
                    {itemDiscount > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                        - R$ {itemDiscount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/sales")}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Voltar para o Histórico
        de Vendas
      </button>
    </div>
  );
};
