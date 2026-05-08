import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    naver?: any;
  }
}

export function SafeNaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = 'naver-map-script';
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    const onReady = () => setReady(Boolean(window.naver?.maps));

    if (existing) {
      if (window.naver?.maps) onReady();
      else existing.addEventListener('load', onReady);
      return () => existing.removeEventListener('load', onReady);
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${(window as any).__NAVER_CLIENT_ID ?? ''}`;
    script.async = true;
    script.onload = onReady;
    document.body.appendChild(script);

    return () => script.removeEventListener('load', onReady);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.naver?.maps) return;
    const center = new window.naver.maps.LatLng(37.3595704, 127.105399);
    new window.naver.maps.Map(mapRef.current, { center, zoom: 15 });
  }, [ready]);

  return <div ref={mapRef} className="h-72 w-full rounded-2xl border border-zinc-200 bg-zinc-50" aria-label="네이버 지도" />;
}
