import React, { useEffect, useState } from "react";
import { categoryApi } from "@/src/api/category";
import { CategoryDto } from "@/src/api/types";
import { Tag, Plus, Trash2, Loader2 } from "lucide-react";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories();
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setCategories(list);
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await categoryApi.createCategory({ description: name.trim(), name: name.trim() });
      setName("");
      loadCategories();
    } catch (e) {
      alert("Erro ao salvar categoria.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Excluir esta categoria?")) return;
    try {
      await categoryApi.deleteCategory(id);
      loadCategories();
    } catch (e) {
      alert("Erro ao excluir categoria.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-purple-400" /> Nova Categoria
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Descrição / Nome da categoria (ex: Bebidas, Roupas...)"
            className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Categorias Cadastradas</h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-1" />
            Carregando...
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-xs">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const label = cat.description || cat.name || cat.title || `Categoria #${cat.id}`;
              return (
                <div
                  key={cat.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-100 block">{label}</span>
                      {cat.createdAt && (
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
