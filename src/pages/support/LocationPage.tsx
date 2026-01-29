import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const LocationPage: React.FC = () => {
  const position = { lat: 37.317929, lng: 126.836123 };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
      <h1 className="text-4xl font-black mb-8 text-brand-dark">
        오시는 길
      </h1>
      
      <div className="bg-gray-100 p-4 rounded-3xl overflow-hidden shadow-lg h-[500px]">
        <Map
          center={position}
          style={{ width: '100%', height: '100%' }}
          level={3}
          className="rounded-2xl"
        >
          <MapMarker position={position}>
            <div className="p-2 text-brand-dark font-bold text-xs">
              NADA Coffee
            </div>
          </MapMarker>
        </Map>
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
