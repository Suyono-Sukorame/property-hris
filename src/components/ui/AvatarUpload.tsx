'use client';
import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface AvatarUploadProps {
  photoUrl?: string;
  initials?: string;
  avatarColor?: string;
  employeeName?: string;
  size?: 'sm' | 'md' | 'lg';
  onPhotoChange?: (dataUrl: string | null) => void;
  editable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-14 h-14 text-base',
  md: 'w-20 h-20 text-xl',
  lg: 'w-24 sm:w-28 h-24 sm:h-28 text-xl sm:text-2xl',
};

const removeButtonSize = {
  sm: '-top-0.5 -right-0.5 w-4 h-4',
  md: '-top-1 -right-1 w-5 h-5',
  lg: '-top-1 -right-1 w-6 h-6',
};

/** Compress image to max 400x400 and max ~200KB as JPEG dataURL */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const MAX = 400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, width, height);

      // Try quality 0.8, then drop if still > ~200KB
      let quality = 0.8;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length > 200 * 1024 * 1.37) {
        quality = 0.6;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      if (dataUrl.length > 200 * 1024 * 1.37) {
        quality = 0.4;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  photoUrl,
  initials = 'EM',
  avatarColor = '#0f766e',
  employeeName,
  size = 'md',
  onPhotoChange,
  editable = true,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onPhotoChange?.(dataUrl);
    } catch {
      // fallback: read as-is
      const reader = new FileReader();
      reader.onload = (ev) => onPhotoChange?.(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange?.(null);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`relative rounded-full overflow-hidden ${sizeClasses[size]} flex items-center justify-center font-bold text-white select-none
          ${editable ? 'cursor-pointer' : ''}
          ${editable && isHovered ? 'ring-2 ring-[#0f766e] ring-offset-2' : ''}
          transition-all duration-150`}
        style={{ backgroundColor: photoUrl ? undefined : avatarColor }}
        onClick={() => editable && fileInputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={editable ? 'Klik untuk ganti foto' : (employeeName || undefined)}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={employeeName || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}

        {/* Camera overlay on hover */}
        {editable && isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
            <Camera className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Remove button */}
      {editable && photoUrl && (
        <button
          type="button"
          onClick={handleRemove}
          className={`absolute ${removeButtonSize[size]} bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow transition-colors z-10`}
          title="Hapus foto"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};
