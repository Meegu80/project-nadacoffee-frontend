import React from 'react';
import { useLocation } from 'react-router-dom';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const SupportPage: React.FC = () => {
    const location = useLocation();
    const type = location.pathname.split('/').pop();

    let title = '고객지원';
    if (type === 'notice') title = '공지사항';
    if (type === 'contact') title = '문의하기';
    if (type === 'location') title = '오시는 길';

    // Location Components
    if (type === 'location') {
        const center = { lat: 35.1953, lng: 129.2136 }; // Approximate location (Near Osiria)
        // User needs to update with exact coordinates for "부산광역시 기장군 기장읍 기장해안로 232"

        return (
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4 text-brand-black dark:text-white">오시는 길</h1>
                    <p className="text-gray-500 text-lg">NADA COFFEE 본사 및 매장 위치를 안내해 드립니다.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-start">
                    {/* Address Info */}
                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-700">
                        <h2 className="text-2xl font-bold mb-6 text-brand-black dark:text-white">본사 주소</h2>
                        <ul className="space-y-4 text-left">
                            <li className="flex items-start">
                                <span className="font-bold w-24 text-gray-500">주소</span>
                                <span className="flex-1 text-gray-800 dark:text-gray-200">부산광역시 기장군 기장읍 기장해안로 232</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold w-24 text-gray-500">전화번호</span>
                                <span className="flex-1 text-gray-800 dark:text-gray-200">051-123-4567</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold w-24 text-gray-500">이메일</span>
                                <span className="flex-1 text-gray-800 dark:text-gray-200">contact@nadacoffee.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Map */}
                    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-700 relative bg-gray-100">
                        {/* 
                            Note: To make this map work, you must:
                            1. Get a Kakao Map API Key from https://developers.kakao.com
                            2. Add it to index.html: <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY"></script>
                            3. Ensure 'react-kakao-maps-sdk' is installed.
                         */}
                        <KakaoMapWrapper center={center} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-black mb-8 text-brand-black dark:text-white">{title}</h1>
            <div className="bg-gray-100 dark:bg-zinc-800 p-20 rounded-3xl">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    준비 중인 페이지입니다.
                </p>
            </div>
        </div>
    );
};

// Seperate component for safe map loading (simulated if no key or error)

const KakaoMapWrapper: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
    try {
        return (
            <Map center={center} style={{ width: "100%", height: "100%" }} level={3}>
                <MapMarker position={center}>
                    <div style={{ padding: "5px", color: "#000" }}>NADA COFFEE <br /> 부산 기장 본점</div>
                </MapMarker>
            </Map>
        );
    } catch (e) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 flex-col p-4">
                <p>지도를 불러올 수 없습니다.</p>
                <p className="text-xs mt-2">index.html에 Kakao API Key가 올바르게 설정되었는지 확인해주세요.</p>
            </div>
        );
    }
};

export default SupportPage;
