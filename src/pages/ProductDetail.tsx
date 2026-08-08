import { categoryApi } from "@/src/api/category";
import { productApi } from "@/src/api/product";
import { CategoryDto, ProductDto } from "@/src/api/types";
import { BarcodeScannerModal } from "@/src/components/BarcodeScannerModal";
import {
  Barcode,
  Camera,
  DollarSign,
  Layers,
  Loader2,
  Package,
  Save,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== "new");

  const [description, setDescription] = useState("");
  const [barCode, setBarCode] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadProductDetail(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error("Error loading categories:", e);
    }
  };

  const loadProductDetail = async (prodId: string) => {
    setLoading(true);
    try {
      const prod = await productApi.getProductById(prodId);
      if (prod) {
        setDescription(prod.description || "");
        setBarCode(prod.barCode || "");
        setPrice(prod.price ? String(prod.price) : "");
        setCostPrice(prod.costPrice ? String(prod.costPrice) : "");
        setStockQuantity(prod.stockQuantity ? String(prod.stockQuantity) : "");
        setCategoryId(prod.categoryId);
        setPhoto(prod.photo || null);
      }
    } catch (err) {
      setErrorMsg("Não foi possível carregar os dados do produto.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg("A descrição do produto é obrigatória.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<ProductDto> = {
        description,
        barCode,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        categoryId: categoryId ? Number(categoryId) : undefined,
        photo: photo || undefined,
      };

      if (isEditing && id) {
        await productApi.updateProduct(parseInt(id, 10), payload);
      } else {
        await productApi.createProduct(payload as any);
      }

      navigate("/products");
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await productApi.deleteProduct(parseInt(id, 10));
      navigate("/products");
    } catch (err: any) {
      setErrorMsg("Falha ao excluir produto.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-xs">Carregando detalhes do produto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Photo Header */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden">
          <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden mb-3 relative group">
            {photo ? (
              <img
                src={photo}
                alt="Foto do Produto"
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-slate-600" />
            )}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition">
              <Upload className="w-6 h-6" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <label className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>{photo ? "Alterar Imagem" : "Adicionar Foto"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Inputs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" /> Descrição do
              Produto
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Camiseta Algodão GG Preto"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-blue-400" /> Código de
                Barras (EAN/GTIN)
              </span>
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <Camera className="w-3 h-3" /> Escanear
              </button>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barCode}
                onChange={(e) => setBarCode(e.target.value)}
                placeholder="ex: 7891234567890"
                className="flex-1 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Preço de
                Venda
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Custo
              </label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Qtd. Estoque
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" /> Categoria
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? "Atualizar Produto" : "Salvar Produto"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl active:scale-95 transition"
              title="Excluir Produto"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(code) => setBarCode(code)}
        title="Escanear Código para o Produto"
      />
    </div>
  );
};
