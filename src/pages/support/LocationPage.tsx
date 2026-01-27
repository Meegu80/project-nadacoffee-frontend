import React from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

const LocationPage: React.FC = () => {
  React.useEffect(() => {
    const container = document.getElementById('map');
    
    // 카카오맵 SDK가 로드되었는지 확인
    if (window.kakao && window.kakao.maps && container) {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(37.317929, 126.836123), // 강남역 인근
          level: 3
        };
        const map = new window.kakao.maps.Map(container, options);

        // 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(37.317929, 126.836123);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
      });
    }
  }, []);

  return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-black mb-8 text-brand-dark">
          오시는 길
        </h1>
        <div className="bg-gray-100 p-4 rounded-3xl overflow-hidden shadow-lg h-[500px]">
          <div id="map" className="w-full h-full rounded-2xl"></div>
        </div>
        <div className="mt-8 space-y-2">
          <p className="text-xl font-bold text-brand-dark">
            경기도 안산시 단원구 고잔2길 45, 코스모프라자 6층 NADA Coffee
          </p>
          <p className="text-gray-500">
            지하철 4호선 중앙역 1번 출구에서 도보 5분
          </p>
        </div>
      </div>
  );
};

export default LocationPage;
