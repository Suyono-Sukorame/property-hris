import { supabase } from '@/lib/supabase';

export interface UploadSelfieOptions {
  employeeId: string;
  type: 'in' | 'out';
  date?: string;
}

/**
 * Mengonversi data URL base64 (data:image/jpeg;base64,...) menjadi Blob biner
 */
export function dataURLToBlob(dataUrl: string): Blob | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error('Failed to convert dataURL to Blob:', error);
    return null;
  }
}

/**
 * Upload foto selfie presensi ke Supabase Object Storage (bucket: 'attendance-selfies')
 * Mengembalikan public URL jika berhasil di-upload ke storage,
 * atau fallback mengembalikan data URL asli bila storage belum dikonfigurasi (zero-crash fallback).
 */
export async function uploadAttendanceSelfie(
  imageData: string | null | undefined,
  options: UploadSelfieOptions
): Promise<string | undefined> {
  if (!imageData) return undefined;

  // Jika sudah berupa URL online (bukan base64 data URL), langsung kembalikan
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  // Jika bukan data URL (misal format SVG demo atau path lokal), kembalikan apa adanya
  if (!imageData.startsWith('data:image/')) {
    return imageData;
  }

  try {
    const blob = dataURLToBlob(imageData);
    if (!blob) return imageData;

    const dateFolder = options.date || new Date().toISOString().slice(0, 10);
    const cleanEmpId = options.employeeId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanEmpId}_${options.type}_${Date.now()}.jpg`;
    const filePath = `${dateFolder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attendance-selfies')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn(
        'Supabase Storage upload warning (falling back to data URL, pastikan migration SQL bucket sudah dijalankan):',
        uploadError.message
      );
      return imageData;
    }

    const { data } = supabase.storage
      .from('attendance-selfies')
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }

    return imageData;
  } catch (err) {
    console.warn('Object storage upload failed with exception, using data URL fallback:', err);
    return imageData;
  }
}
