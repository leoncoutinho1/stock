import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/src/api/product";
import { ProductDto } from "@/src/api/types";
import { BarcodeScannerModal } from "@/src/components/BarcodeScannerModal";
import {
  Search,
  Camera,
  Plus,
  Package,
  Barcode,
  RefreshCw,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery = "") => {
    setErrorMsg(null);
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const searchRes = await productApi.searchProducts(searchQuery);
        const list = Array.isArray(searchRes)
          ? searchRes
          : (searchRes as any)?.data || [];
        setProducts(list);
      } else {
        const listRes = await productApi.getProducts(0, 50);
        setProducts(listRes.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setErrorMsg("Falha ao carregar produtos. Verifique sua conexão.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchText);
  };

  const handleBarcodeScanned = (code: string) => {
    setSearchText(code);
    fetchProducts(code);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Action Bar & Search */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchText && (
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                fetchProducts("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </form>

        <button
          onClick={() => setScanOpen(true)}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 rounded-2xl active:scale-95 transition"
          title="Escanear Código de Barras"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate("/products/new")}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center justify-center"
          title="Novo Produto"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </span>
          <button
            onClick={() => fetchProducts(searchText)}
            className="text-xs text-blue-400 underline font-semibold"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs">Carregando catálogo de produtos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500">
            Cadastre um novo produto ou realize uma nova busca.
          </p>
          <button
            onClick={() => navigate("/products/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate(`/products/${prod.id}`)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {prod.photo ? (
                    <img
                      src={prod.photo}
                      alt={prod.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-slate-100 line-clamp-1">
                    {prod.description}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
                      <Barcode className="w-3 h-3 text-blue-400" /> {prod.barCode || "S/ COD"}
                    </span>
                    {prod.categoryName && (
                      <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md text-[10px] text-slate-300">
                        <Tag className="w-3 h-3 text-indigo-400" /> {prod.categoryName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-400 block">
                  R$ {(prod.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Estoque: <strong className="text-slate-200">{prod.stockQuantity ?? 0}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={handleBarcodeScanned}
        title="Buscar Produto por Código"
      />
    </div>
  );
};
