import React, { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export const PWAPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;

    if (isIOS && !isStandalone) {
      const hasDismissed = localStorage.getItem("@pwa:dismissed_ios");
      if (!hasDismissed) {
        setShowIOSPrompt(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (showIOSPrompt) {
      localStorage.setItem("@pwa:dismissed_ios", "true");
    }
  };

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom border border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Instalar aplicativo Stock</h4>
            <p className="text-xs text-blue-100">Adicione à tela inicial para acesso rápido offline.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl shadow active:scale-95 transition"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-blue-100 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 bg-slate-900/95 border border-slate-800 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-lg animate-in slide-in-from-bottom">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Share className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Instalar no iOS (Safari)</h4>
              <p className="text-xs text-slate-400">
                Toque no ícone de <span className="text-blue-400 font-semibold">Compartilhar</span> e selecione <span className="text-slate-200 font-semibold">"Adicionar à Tela de Início"</span>.
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
