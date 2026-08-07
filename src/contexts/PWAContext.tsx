import React, { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
  promptInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const iosCheck =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const standaloneCheck =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    setIsIOS(iosCheck);
    setIsStandalone(standaloneCheck);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS && !isStandalone) {
      setShowIOSModal(true);
    } else {
      alert(
        "Para adicionar à tela inicial, use o menu do navegador (três pontos ou compartilhar) e selecione 'Adicionar à tela de início'."
      );
    }
  };

  return (
    <PWAContext.Provider
      value={{
        canInstall: Boolean(deferredPrompt) || (isIOS && !isStandalone),
        isStandalone,
        isIOS,
        showIOSModal,
        setShowIOSModal,
        promptInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWAInstall must be used within a PWAProvider");
  }
  return context;
};
