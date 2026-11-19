/**
 * Reusable Smart Document Optimizer
 * Mengonversi gambar scan/dokumen apa pun (PNG, JPEG, HEIC, dsb.)
 * ke format WebP berkualitas tinggi dengan kompresi maksimal (ukuran terkecil)
 * sehingga tulisan teks/NIK/tanda tangan pada dokumen tetap tajam dan jelas terbaca.
 */

export interface OptimizedDocumentResult {
  dataUrl: string;
  blob: Blob;
  fileName: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

export interface DocumentOptimizerOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.82)
  targetFileName?: string;
}

export async function optimizeDocumentToWebP(
  file: File,
  options: DocumentOptimizerOptions = {}
): Promise<OptimizedDocumentResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    targetFileName,
  } = options;

  return new Promise((resolve, reject) => {
    // Validasi file adalah gambar
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang diunggah harus berupa file gambar dokumen (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file dokumen.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
      img.onload = () => {
        // Hitung dimensi target dengan menjaga aspect ratio
        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;

        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        // Siapkan Canvas resolusi tinggi dengan anti-aliasing
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context 2D tidak tersedia di browser ini.'));
          return;
        }

        // Optimasi rendering teks dokumen agar tetap tajam
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background putih untuk dokumen transparan
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Gambar dokumen ke canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert ke format WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengonversi dokumen ke format WebP.'));
              return;
            }

            const cleanBaseName = (targetFileName || file.name).replace(/\.[^/.]+$/, '');
            const finalFileName = `${cleanBaseName}.webp`;

            const originalSizeBytes = file.size;
            const optimizedSizeBytes = blob.size;
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100)
            );

            resolve({
              dataUrl: webpDataUrl,
              blob,
              fileName: finalFileName,
              originalSizeBytes,
              optimizedSizeBytes,
              reductionPercentage,
              width: targetWidth,
              height: targetHeight,
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes ke string ukuran yang mudah dibaca (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
