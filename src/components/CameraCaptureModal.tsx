import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Upload,
  Check,
  RotateCcw,
  Zap,
  ZapOff,
  AlertCircle,
} from "lucide-react";
import { compressImage } from "../utils/imageCompressor";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (compressedBase64: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Tirar Foto do Produto",
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedPreview(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode: "environment" | "user") => {
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Acesso à câmera não suportado neste navegador.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      // Checa suporte à lanterna (torch)
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = (track?.getCapabilities && track.getCapabilities()) as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
      setTorchOn(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      let message = "Não foi possível acessar a câmera do dispositivo.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Permissão de câmera negada. Habilite a câmera nas configurações do navegador.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "Nenhuma câmera encontrada no dispositivo.";
      }
      setErrorMsg(message);
    }
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn("Falha ao alternar lanterna:", err);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleTakeSnapshot = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(60);
      }
      const compressed = await compressImage(videoRef.current, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.75,
      });
      setCapturedPreview(compressed);
      stopCamera();
    } catch (err) {
      console.error("Error capturing snapshot:", err);
      setErrorMsg("Erro ao capturar o quadro da câmera.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.75,
      });
      setCapturedPreview(compressed);
      stopCamera();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Falha ao processar e compactar a imagem selecionada.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-100 text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="relative bg-black min-h-[320px] max-h-[50vh] flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPreview}
                alt="Foto Capturada"
                className="w-full h-auto max-h-[50vh] object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow backdrop-blur">
                Compactada com sucesso
              </div>
            </div>
          ) : (
            <>
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && stream && el.srcObject !== stream) {
                    el.srcObject = stream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full min-h-[320px] max-h-[50vh] object-cover"
              />

              {/* Guia de enquadramento */}
              {!errorMsg && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[80%] aspect-square border-2 border-dashed border-white/40 rounded-2xl flex items-center justify-center">
                    <span className="text-[11px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
                      Enquadre o produto
                    </span>
                  </div>
                </div>
              )}

              {/* Controles de Câmera Sobrepostos */}
              {!errorMsg && (
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2.5 rounded-full backdrop-blur transition active:scale-95 ${
                        torchOn ? "bg-amber-500 text-white" : "bg-black/60 text-white hover:bg-black/80"
                      }`}
                      title="Alternar Lanterna"
                    >
                      {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur transition active:scale-95"
                    title="Alternar Câmera Frontal/Traseira"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Erro de permissão / indisponibilidade */}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-slate-200 font-medium px-4">{errorMsg}</p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 active:scale-95 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs gap-2 z-10">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Compactando imagem...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
          {capturedPreview ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Tirar Outra</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Foto</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {/* Botão de Upload da Galeria */}
              <label className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl cursor-pointer active:scale-95 transition">
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Botão Principal de Disparo (Shutter Button) */}
              <button
                type="button"
                disabled={!!errorMsg || isProcessing}
                onClick={handleTakeSnapshot}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-blue-600/25 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
