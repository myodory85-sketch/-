import { useState } from 'react';
import { SingleImageUploader } from './SingleImageUploader';

const categories = ['이동성', '화장실', '장애인화장실', '엘리베이터', '편의시설'];

export function ChecklistStep() {
  const [photos, setPhotos] = useState<Record<string, File | null>>({});

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">단계별 사진 업로드</h3>
      <p className="text-sm text-zinc-600">각 항목마다 사진을 한 장씩 업로드하세요.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categories.map((item) => (
          <div key={item}>
            <SingleImageUploader
              label={item}
              onImageUpload={(file) => setPhotos((prev) => ({ ...prev, [item]: file }))}
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-zinc-100 p-3 text-sm">업로드 완료: {Object.values(photos).filter(Boolean).length} / {categories.length}</div>
    </section>
  );
}
