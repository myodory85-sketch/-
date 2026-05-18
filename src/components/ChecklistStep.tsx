import { useMemo, useState } from 'react';
import { SingleImageUploader } from './SingleImageUploader';
import { Button } from './ui/button';
import { toast } from 'sonner';

const categories = ['이동성', '화장실', '장애인화장실', '엘리베이터', '편의시설'];
const SURVEY_STORAGE_KEY = 'seoul_accessibility_survey';

const seoulDistrictPlaces: Record<string, string> = {
  강남구: '서울시 강남구 코엑스',
  강동구: '서울시 강동구 길동생태공원',
  강북구: '서울시 강북구 북서울꿈의숲',
  강서구: '서울시 강서구 서울식물원',
  관악구: '서울시 관악구 서울대학교 관악캠퍼스',
  광진구: '서울시 광진구 어린이대공원',
  구로구: '서울시 구로구 고척스카이돔',
  금천구: '서울시 금천구 금천폭포공원',
  노원구: '서울시 노원구 화랑대철도공원',
  도봉구: '서울시 도봉구 평화문화진지',
  동대문구: '서울시 동대문구 서울풍물시장',
  동작구: '서울시 동작구 노량진수산시장',
  마포구: '서울시 마포구 하늘공원',
  서대문구: '서울시 서대문구 서대문형무소역사관',
  서초구: '서울시 서초구 예술의전당',
  성동구: '서울시 성동구 서울숲',
  성북구: '서울시 성북구 북악산 한양도성길',
  송파구: '서울시 송파구 올림픽공원',
  양천구: '서울시 양천구 서서울호수공원',
  영등포구: '서울시 영등포구 여의도한강공원',
  용산구: '서울시 용산구 국립중앙박물관',
  은평구: '서울시 은평구 북한산둘레길',
  종로구: '서울시 종로구 경복궁',
  중구: '서울시 중구 남산서울타워',
  중랑구: '서울시 중랑구 용마폭포공원',
};

export function ChecklistStep() {
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [selectedDistrict, setSelectedDistrict] = useState('강남구');

  const selectedPlace = seoulDistrictPlaces[selectedDistrict];
  const completedCount = useMemo(() => Object.values(photos).filter(Boolean).length, [photos]);

  const handleSaveSurvey = () => {
    const payload = {
      city: '서울시',
      district: selectedDistrict,
      place: selectedPlace,
      uploadedPhotoNames: Object.fromEntries(
        Object.entries(photos).map(([category, file]) => [category, file?.name ?? null]),
      ),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(payload));
    toast.success('서울시 현장 조사 데이터가 브라우저에 저장되었습니다.');
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">서울시 25개 구 현장 조사</h3>
      <p className="text-sm text-zinc-600">서울시 자치구를 선택한 뒤 장소 1곳을 기준으로 단계별 사진을 업로드하세요.</p>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
        <label className="text-sm font-medium">자치구 선택 (25개 구)</label>
        <select
          className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          {Object.keys(seoulDistrictPlaces).map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <div className="rounded-lg bg-zinc-100 p-3 text-sm">
          조사 대상 장소: <span className="font-semibold">{selectedPlace}</span>
        </div>
      </div>

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

      <div className="rounded-xl bg-zinc-100 p-3 text-sm">업로드 완료: {completedCount} / {categories.length}</div>

      <Button type="button" onClick={handleSaveSurvey} className="w-full sm:w-auto">
        조사 파일 저장
      </Button>
    </section>
  );
}
