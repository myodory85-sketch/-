import React, { useEffect, useState } from 'react';
import { Camera, X, CheckCircle2 } from 'lucide-react';

interface SingleImageUploaderProps {
  label: string;
  onImageUpload: (file: File | null) => void;
}

const compressImage = (file: File, maxBytes = 1024 * 1024, maxDimension = 1280): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
    };

    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let quality = 0.9;
      const step = () => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Failed to compress image'));
          if (blob.size <= maxBytes || quality <= 0.4) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            quality -= 0.1;
            step();
          }
        }, 'image/jpeg', quality);
      };
      step();
    };

    img.onerror = () => reject(new Error('Image load error'));
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
};

export function SingleImageUploader({ label, onImageUpload }: SingleImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(url);
      onImageUpload(compressed);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-4 space-y-3">
      <p className="text-base font-semibold">{label} 사진</p>
      {preview ? (
        <div className="relative h-44 overflow-hidden rounded-xl">
          <img src={preview} alt={`${label} 미리보기`} className="h-full w-full object-cover" />
          <button className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white" onClick={() => { setPreview(null); onImageUpload(null); }}>
            <X size={18} />
          </button>
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs text-white">
            <CheckCircle2 size={14} /> 업로드 완료
          </div>
        </div>
      ) : (
        <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700 active:scale-[0.99]">
          {isCompressing ? <span className="text-sm font-semibold">압축 중...</span> : <><Camera size={32} /><span className="mt-2 text-sm font-semibold">사진 찍기 또는 선택</span></>}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}
