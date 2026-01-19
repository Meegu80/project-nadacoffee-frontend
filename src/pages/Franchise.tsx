import React from 'react';

const FranchisePage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-black mb-8 text-brand-black dark:text-white">FRANCHISE</h1>
            <div className="bg-gray-100 dark:bg-zinc-800 p-20 rounded-3xl">
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
                    가맹점 개설 문의
                </p>
                <button className="px-8 py-3 bg-brand-yellow text-brand-black font-bold rounded-full hover:bg-yellow-400 transition-colors">
                    상담 신청하기
                </button>
            </div>
        </div>
    );
};

export default FranchisePage;
