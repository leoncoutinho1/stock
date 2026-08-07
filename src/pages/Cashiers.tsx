import React, { useEffect, useState } from "react";
import { cashierApi } from "@/src/api/cashier";
import { Wallet, Plus, Trash2, Loader2 } from "lucide-react";

export const Cashiers: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.getCashiers();
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await cashierApi.createCashier({ name: name.trim() });
      setName("");
      loadItems();
    } catch (e) {
      alert("Erro ao criar caixa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Excluir este caixa?")) return;
    try {
      await cashierApi.deleteCashier(id);
      loadItems();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-blue-400" /> Novo Operador de Caixa
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Caixa Principal, Operador João"
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Caixas Cadastrados</h3>
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-1" />
            Carregando...
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-xs">Nenhum caixa cadastrado.</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((c) => {
              const label = c.name || c.description || c.title || `Caixa #${c.id}`;
              return (
                <div
                  key={c.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-100">{label}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
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
