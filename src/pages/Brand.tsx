import React from 'react';
import { useLocation } from 'react-router-dom';

const BrandPage: React.FC = () => {
    const location = useLocation();
    const subPage = location.pathname.split('/').pop();

    return (
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-black mb-8 text-brand-black dark:text-white uppercase">
                {subPage === 'process' ? 'Deep Freshing 공법' : 'About Us'}
            </h1>
            <div className="bg-gray-100 dark:bg-zinc-800 p-20 rounded-3xl">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    {subPage === 'process'
                        ? '나다커피만의 특별한 Deep Freshing 공법을 소개합니다.'
                        : '나다커피의 브랜드 스토리를 소개합니다.'}
                </p>
            </div>
        </div>
    );
};

export default BrandPage;
