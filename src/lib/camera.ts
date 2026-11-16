/**
 * Camera & Image Utilities
 * PT Bumi Raya Propertindo HRIS
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Captures a square 1:1 frame from an active HTMLVideoElement and compresses
 * it into a lightweight base64 JPEG data URL (~35 - 45 KB).
 */
export function captureAndCompressVideoFrame(
  video: HTMLVideoElement,
  options: CompressionOptions = {}
): string | null {
  const { maxWidth = 400, maxHeight = 400, quality = 0.75 } = options;

  if (!video.videoWidth || !video.videoHeight) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const size = Math.min(maxWidth, maxHeight);
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Center-crop 1:1 square from video stream
  const minDim = Math.min(video.videoWidth, video.videoHeight);
  const startX = (video.videoWidth - minDim) / 2;
  const startY = (video.videoHeight - minDim) / 2;

  // Mirror effect so front-facing camera acts like a selfie mirror
  ctx.translate(size, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(
    video,
    startX,
    startY,
    minDim,
    minDim,
    0,
    0,
    size,
    size
  );

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Generates an SVG/DataURL avatar badge for demo / simulation mode
 * when the user tests or presents without physical camera access.
 */
export function generateDemoAvatarPhoto(
  initials: string = 'PT',
  name: string = 'Karyawan',
  bgColor: string = '#0f766e'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, '#064e3b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 400);

  // Decorative border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 386, 386);

  // Avatar Initials
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.toUpperCase(), 200, 170);

  // Label Demo Verifikasi K3
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('VERIFIKASI PRESENSI', 200, 275);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '18px sans-serif';
  ctx.fillText(name.slice(0, 24), 200, 315);

  return canvas.toDataURL('image/jpeg', 0.8);
}
