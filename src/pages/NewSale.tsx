import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/src/api/product";
import { paymentFormApi } from "@/src/api/paymentForm";
import { cashierApi } from "@/src/api/cashier";
import { checkoutApi } from "@/src/api/checkout";
import { saleApi } from "@/src/api/sale";
import { ProductDto, PaymentFormDto, CashierDto, CheckoutDto } from "@/src/api/types";
import { BarcodeScannerModal } from "@/src/components/BarcodeScannerModal";
import {
  Camera,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  CheckCircle2,
  Loader2,
  DollarSign,
  CreditCard,
  User,
  ArrowRight,
} from "lucide-react";

interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
}

export const NewSale: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductDto[]>([]);
  const [searching, setSearching] = useState(false);

  const [paymentForms, setPaymentForms] = useState<PaymentFormDto[]>([]);
  const [cashiers, setCashiers] = useState<CashierDto[]>([]);
  const [checkouts, setCheckouts] = useState<CheckoutDto[]>([]);

  const [selectedPaymentFormId, setSelectedPaymentFormId] = useState<number | undefined>();
  const [selectedCashierId, setSelectedCashierId] = useState<number | undefined>();
  const [selectedCheckoutId, setSelectedCheckoutId] = useState<number | undefined>();
  const [clientName, setClientName] = useState("");

  const [scanOpen, setScanOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  const loadAuxiliaryData = async () => {
    try {
      const [pfRes, cashRes, chkRes] = await Promise.all([
        paymentFormApi.getPaymentForms().catch(() => ({ data: [] })),
        cashierApi.getCashiers().catch(() => ({ data: [] })),
        checkoutApi.getCheckouts().catch(() => ({ data: [] })),
      ]);

      if (pfRes.data && pfRes.data.length > 0) {
        setPaymentForms(pfRes.data);
        setSelectedPaymentFormId(pfRes.data[0].id);
      }
      if (cashRes.data && cashRes.data.length > 0) {
        setCashiers(cashRes.data);
        setSelectedCashierId(cashRes.data[0].id);
      }
      if (chkRes.data && chkRes.data.length > 0) {
        setCheckouts(chkRes.data);
        setSelectedCheckoutId(chkRes.data[0].id);
      }
    } catch (e) {
      console.error("Error loading PDV data:", e);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await productApi.searchProducts(query);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setSearchResults(list);
    } catch (e) {
      console.error("Product search error:", e);
    } finally {
      setSearching(false);
    }
  };

  const addProductToCart = (prod: ProductDto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1, unitPrice: prod.price || 0 }];
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleBarcodeScanned = async (code: string) => {
    try {
      const res = await productApi.searchProducts(code);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) {
        addProductToCart(list[0]);
      } else {
        alert(`Produto com código ${code} não foi encontrado.`);
      }
    } catch (e) {
      alert("Erro ao buscar produto pelo código de barras.");
    }
  };

  const updateQuantity = (prodId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === prodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (prodId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      setErrorMsg("Adicione pelo menos 1 item ao carrinho.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const saleItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.quantity * item.unitPrice,
      }));

      const payload = {
        paymentFormId: selectedPaymentFormId,
        cashierId: selectedCashierId,
        checkoutId: selectedCheckoutId,
        clientName: clientName || undefined,
        items: saleItems,
        totalAmount,
      };

      await saleApi.createSale(payload as any);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      navigate("/sales");
    } catch (err: any) {
      console.error("Sale error:", err);
      setErrorMsg(err?.message || "Falha ao finalizar venda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Product Search & Scanner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Digitar nome ou código..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setScanOpen(true)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Escanear com a Câmera Web"
          >
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">Escanear</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1 shadow-xl">
            {searchResults.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addProductToCart(prod)}
                className="p-2 hover:bg-slate-800 rounded-xl flex items-center justify-between cursor-pointer text-xs transition"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{prod.description}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{prod.barCode || "S/ COD"}</span>
                </div>
                <span className="font-bold text-emerald-400">
                  R$ {(prod.price || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Cart Items List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-blue-400" /> Carrinho ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
          </h3>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-red-400 hover:text-red-300 font-medium"
            >
              Limpar
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-1">
            <p>Carrinho vazio.</p>
            <p className="text-[11px] text-slate-600">Use a busca acima ou a câmera para adicionar produtos.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-100 truncate">
                    {item.product.description}
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    R$ {(item.unitPrice * item.quantity).toFixed(2)}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({item.quantity}x R$ {item.unitPrice.toFixed(2)})
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg active:scale-95 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 px-1.5">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sale Options (Payment Form & Client) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Forma de Pagamento
          </label>
          <select
            value={selectedPaymentFormId || ""}
            onChange={(e) => setSelectedPaymentFormId(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {paymentForms.map((pf) => (
              <option key={pf.id} value={pf.id}>
                {pf.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" /> Cliente (Opcional)
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nome do cliente..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xl">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total da Venda</span>
          <span className="text-xl font-extrabold text-emerald-400">
            R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={handleFinalizeSale}
          disabled={submitting || cart.length === 0}
          className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Finalizar Venda
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={handleBarcodeScanned}
        title="Escanear Código do Produto para o Carrinho"
      />
    </div>
  );
};
