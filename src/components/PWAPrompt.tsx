import React, { useState } from "react";
import { Download, X, Share, Smartphone, PlusSquare } from "lucide-react";
import { usePWAInstall } from "@/src/contexts/PWAContext";

export const PWAPrompt: React.FC = () => {
  const {
    canInstall,
    isStandalone,
    isIOS,
    showIOSModal,
    setShowIOSModal,
    promptInstall,
  } = usePWAInstall();

  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || dismissed) {
    if (showIOSModal) {
      // Show modal if requested explicitly by button
    } else {
      return null;
    }
  }

  return (
    <>
      {/* Floating Bottom Banner if installable */}
      {canInstall && !dismissed && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">Instalar App Stock PWA</h4>
              <p className="text-[11px] text-blue-100">Adicione à tela inicial do seu celular.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={promptInstall}
              className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl shadow active:scale-95 transition"
            >
              Instalar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-blue-100 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Modal Tutorial Instructions */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                <Share className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Adicionar à Tela de Início (iOS)</h3>
              <p className="text-xs text-slate-400">
                Siga os 2 passos abaixo no Safari do iPhone/iPad:
              </p>
            </div>

            <div className="space-y-3 bg-slate-800/60 p-3 rounded-2xl text-xs border border-slate-700/60">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <p className="text-slate-200">
                  Toque no ícone de <span className="font-bold text-blue-400">Compartilhar</span> na barra do Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <p className="text-slate-200">
                  Role a lista de opções e selecione <span className="font-bold text-emerald-400 flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5 inline" /> "Adicionar à Tela de Início"</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs active:scale-95 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
