export interface CompressedImageResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  blurDataUrl: string;
}

export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // 1. Full-size canvas for compressed WebP
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas 2D context"));
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Tiny canvas for blur placeholder (16px)
        const blurCanvas = document.createElement("canvas");
        const blurWidth = 16;
        const blurHeight = Math.max(1, Math.round((height * blurWidth) / width));
        blurCanvas.width = blurWidth;
        blurCanvas.height = blurHeight;

        const blurCtx = blurCanvas.getContext("2d");
        let blurDataUrl = "";
        if (blurCtx) {
          blurCtx.drawImage(img, 0, 0, blurWidth, blurHeight);
          blurDataUrl = blurCanvas.toDataURL("image/webp", 0.5);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }

            resolve({
              blob,
              width,
              height,
              sizeBytes: blob.size,
              originalSizeBytes: file.size,
              blurDataUrl,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image file into Image object"));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
