import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
      <h1 className="text-4xl font-black mb-8 text-brand-black dark:text-white">문의하기</h1>
      <div className="bg-gray-100 dark:bg-zinc-800 p-20 rounded-3xl">
        <p className="text-xl text-gray-500 dark:text-gray-400">
          문의하기 페이지입니다.
        </p>
      </div>
    </div>
  );
};

export default Contact;
