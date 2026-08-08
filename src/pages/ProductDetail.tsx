import { Category, categoryApi } from "@/src/api/category";
import { productApi } from "@/src/api/product";
import { ProductDto } from "@/src/api/types";
import { BarcodeScannerModal } from "@/src/components/BarcodeScannerModal";
import {
  Barcode,
  Boxes,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  Layers,
  Loader2,
  Package,
  Plus,
  Ruler,
  Save,
  Scale,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== "new");

  // Form Fields
  const [description, setDescription] = useState("");
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [mainBarcode, setMainBarcode] = useState<string | null>(null);
  const [newBarcodeInput, setNewBarcodeInput] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [unit, setUnit] = useState("UN");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // Configuration Switches
  const [isActive, setIsActive] = useState(true);
  const [composite, setComposite] = useState(false);
  const [validityDays, setValidityDays] = useState("0");
  const [integrateScale, setIntegrateScale] = useState(false);

  // Metadata / Audit Fields
  const [createdAt, setCreatedAt] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
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
    setErrorMsg(null);
    try {
      const res = await productApi.getProductById(prodId);
      const prod = (res as any)?.value || res;

      if (prod) {
        setDescription(prod.description || "");

        const loadedBarcodes: string[] =
          Array.isArray(prod.barcodes) && prod.barcodes.length > 0
            ? prod.barcodes
            : prod.mainBarcode
              ? [prod.mainBarcode]
              : prod.barCode
                ? [prod.barCode]
                : [];
        const loadedMainBarcode: string | null =
          prod.mainBarcode || loadedBarcodes[0] || null;

        setBarcodes(loadedBarcodes);
        setMainBarcode(loadedMainBarcode);

        setPrice(
          prod.price !== undefined && prod.price !== null
            ? String(prod.price)
            : "",
        );
        setCostPrice(
          prod.cost !== undefined && prod.cost !== null
            ? String(prod.cost)
            : prod.costPrice !== undefined
              ? String(prod.costPrice)
              : "",
        );
        setProfitMargin(
          prod.profitMargin !== undefined && prod.profitMargin !== null
            ? String(prod.profitMargin)
            : "",
        );
        setStockQuantity(
          prod.quantity !== undefined && prod.quantity !== null
            ? String(prod.quantity)
            : prod.stockQuantity !== undefined
              ? String(prod.stockQuantity)
              : "",
        );
        setUnit(prod.unit || "UN");
        setCategoryId(prod.categoryId || "");
        setCategoryDescription(prod.categoryDescription || "");
        setPhoto(prod.imageUrl || prod.photo || null);
        setIsActive(prod.isActive ?? true);
        setComposite(prod.composite ?? false);
        setValidityDays(
          prod.validityDays !== undefined && prod.validityDays !== null
            ? String(prod.validityDays)
            : "0",
        );
        setIntegrateScale(prod.integrateScale ?? false);
        setCreatedAt(prod.createdAt || "");
        setCreatedBy(prod.createdBy || "");
        setUpdatedAt(prod.updatedAt || "");
        setUpdatedBy(prod.updatedBy || "");
      }
    } catch (err) {
      console.error("Error loading product detail:", err);
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

  const handleAddBarcode = () => {
    const code = newBarcodeInput.trim();
    if (code) {
      if (!barcodes.includes(code)) {
        const updated = [...barcodes, code];
        setBarcodes(updated);
        if (!mainBarcode) setMainBarcode(code);
      }
      setNewBarcodeInput("");
    }
  };

  const handleRemoveBarcode = (codeToRemove: string) => {
    const updated = barcodes.filter((c) => c !== codeToRemove);
    setBarcodes(updated);
    if (mainBarcode === codeToRemove) {
      setMainBarcode(updated[0] || null);
    }
  };

  const handleSetMainBarcode = (code: string) => {
    setMainBarcode(code);
  };

  // Calculate live profit margin if price and cost are modified
  const currentCost = parseFloat(costPrice) || 0;
  const currentPrice = parseFloat(price) || 0;
  const liveProfitMargin =
    currentCost > 0
      ? (((currentPrice - currentCost) / currentCost) * 100).toFixed(2)
      : profitMargin;

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
        description: description.trim(),
        cost: parseFloat(costPrice) || 0,
        price: parseFloat(price) || 0,
        quantity: parseFloat(stockQuantity) || 0,
        unit: unit.trim() || "UN",
        categoryId: categoryId || "",
        barcodes: barcodes,
        mainBarcode: mainBarcode || barcodes[0] || null,
        imageUrl: photo || undefined,
        isActive,
        composite,
        validityDays: parseInt(validityDays, 10) || 0,
        integrateScale,
      };

      if (isEditing && id) {
        await productApi.updateProduct(id, payload as any);
      } else {
        await productApi.createProduct(payload as any);
      }

      navigate("/products");
    } catch (err: any) {
      console.error("Error saving product:", err);
      setErrorMsg(err?.message || "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await productApi.deleteProduct(id);
      navigate("/products");
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setErrorMsg("Falha ao excluir produto.");
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
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
      <form onSubmit={handleSave} className="space-y-4 pb-12">
        {/* Photo & Active Status Header */}
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

          <label className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>{photo ? "Alterar Imagem" : "Adicionar Foto"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          {/* Active Status Badge Toggle */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`mt-1 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
              isActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Produto Ativo</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Produto Inativo</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-400" /> Dados Principais
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Descrição do Produto *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: CHA VERDE LEAO LIMAO ZERO 300ML"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Barcodes Management Element */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-blue-400" /> Código de Barras
              </span>
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <Camera className="w-3 h-3" /> Escanear
              </button>
            </label>

            {/* Input to add new barcode */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newBarcodeInput}
                onChange={(e) => setNewBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBarcode();
                  }
                }}
                placeholder="Digite um código e clique em Adicionar"
                className="flex-1 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddBarcode}
                className="px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {/* List of Barcodes */}
            <div className="flex flex-wrap gap-2 pt-1">
              {barcodes.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">
                  Nenhum código de barras cadastrado
                </span>
              ) : (
                barcodes.map((code) => {
                  const isMain = code === mainBarcode;
                  return (
                    <div
                      key={code}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
                        isMain
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/30"
                          : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetMainBarcode(code)}
                        title={
                          isMain
                            ? "Código Principal (clique nos outros para alterar)"
                            : "Clique para marcar como Código Principal"
                        }
                        className="focus:outline-none flex items-center"
                      >
                        <Star
                          className={`w-3.5 h-3.5 transition ${
                            isMain
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                              : "text-slate-500 hover:text-amber-400"
                          }`}
                        />
                      </button>

                      <span className="select-all">{code}</span>

                      {isMain && (
                        <span className="text-[9px] font-sans font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Principal
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveBarcode(code)}
                        className="text-slate-500 hover:text-red-400 ml-1 transition"
                        title="Remover código"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" /> Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.description || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-amber-400" /> Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="UN">UN (Unidade)</option>
                <option value="KG">KG (Quilograma)</option>
                <option value="LT">LT (Litro)</option>
                <option value="PC">PC (Pacote)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Cost & Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Preço, Custo
            e Estoque
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Preço
                (R$) *
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
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Custo (R$)
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
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Margem
                Lucro (%)
              </label>
              <input
                type="text"
                readOnly
                value={liveProfitMargin ? `${liveProfitMargin}%` : "0.00%"}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-teal-400 font-semibold focus:outline-none cursor-default"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Quantidade
              </label>
              <input
                type="number"
                step="any"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Configuration Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" /> Configurações
            Adicionais
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIntegrateScale(!integrateScale)}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition ${
                integrateScale
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <Scale className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">
                  {integrateScale ? "Sim" : "Não"}
                </span>
              </div>
              <span className="text-xs font-semibold">Integrar Balança</span>
            </button>

            <button
              type="button"
              onClick={() => setComposite(!composite)}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition ${
                composite
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <Boxes className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">
                  {composite ? "Sim" : "Não"}
                </span>
              </div>
              <span className="text-xs font-semibold">Produto Composto</span>
            </button>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Validade
              (Dias)
            </label>
            <input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 4: Audit & Metadata (Readonly, shown when editing) */}
        {isEditing && (createdAt || createdBy || updatedAt || updatedBy) && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 space-y-2 text-slate-400">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Informações de
              Auditoria
            </h3>
            {createdBy ? (
              <div className="flex items-center gap-2 text-xs">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Criado por:{" "}
                  <strong className="text-slate-300">{createdBy}</strong>
                  {createdAt ? ` em ${formatDate(createdAt)}` : ""}
                </span>
              </div>
            ) : null}

            {updatedBy ? (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Atualizado por:{" "}
                  <strong className="text-slate-300">{updatedBy}</strong>
                  {updatedAt ? ` em ${formatDate(updatedAt)}` : ""}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
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
              className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl active:scale-95 transition flex items-center justify-center"
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
        onScan={(code) => {
          if (code) {
            const trimmed = code.trim();
            if (!barcodes.includes(trimmed)) {
              const updated = [...barcodes, trimmed];
              setBarcodes(updated);
              if (!mainBarcode) setMainBarcode(trimmed);
            }
          }
        }}
        title="Escanear Código para o Produto"
      />
    </div>
  );
};
