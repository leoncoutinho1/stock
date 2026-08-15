export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp" | "image/png";
}

/**
 * Compacta e redimensiona uma imagem a partir de um File, Blob, HTMLVideoElement ou Data URL string.
 * Retorna uma Promise com a string em formato Data URL (base64) compactada.
 */
export async function compressImage(
  source: File | Blob | HTMLVideoElement | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.75,
    mimeType = "image/jpeg",
  } = options;

  if (source instanceof HTMLVideoElement) {
    return captureAndCompressVideoFrame(source, maxWidth, maxHeight, quality, mimeType);
  }

  const dataUrl = typeof source === "string" ? source : await fileToDataUrl(source);
  return compressDataUrl(dataUrl, maxWidth, maxHeight, quality, mimeType);
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function captureAndCompressVideoFrame(
  video: HTMLVideoElement,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const srcWidth = video.videoWidth || video.clientWidth || 640;
      const srcHeight = video.videoHeight || video.clientHeight || 480;

      let targetWidth = srcWidth;
      let targetHeight = srcHeight;

      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Não foi possível inicializar o contexto 2D do Canvas.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      const result = canvas.toDataURL(mimeType, quality);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function compressDataUrl(
  dataUrl: string,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Não foi possível inicializar o contexto 2D do Canvas.");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error("Falha ao carregar a imagem para compactação."));
    };

    img.src = dataUrl;
  });
}
