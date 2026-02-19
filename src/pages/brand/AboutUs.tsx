import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';

// 이미지 임포트
import heroImg from '../../assets/brand/04-01.jpg';
import identityImg from '../../assets/brand/05-01.png';
import colorImg1 from '../../assets/brand/04-02.jpg';
import colorImg2 from '../../assets/brand/04-03.jpg';
import colorImg3 from '../../assets/brand/04-04.jpg';
import factoryImg from '../../assets/brand/04-05.jpg';

const AboutUs: React.FC = () => {
  const historyData = [
    { year: '2026', items: ['나다커피 글로벌 1호점 오픈 (뉴욕)', '브랜드 리뉴얼 및 차세대 스마트 스토어 도입', 'ESG 경영 선포 및 친환경 패키지 전면 교체'] },
    { year: '2025', items: ['전국 가맹점 3,500호점 돌파', '2025 한국 소비자 만족도 1위 수상', '나다커피 전용 모바일 앱 멤버십 500만 명 달성'] },
    { year: '2024', items: ['제2 로스팅 스마트 팩토리 준공', '신메뉴 ‘딥 프레싱’ 시리즈 누적 판매 1,000만 잔 돌파', '베트남 현지 원두 농장 직영 계약 체결'] },
    { year: '2023', items: ['가맹점 2,500호점 돌파', '대한민국 브랜드 명예의 전당 커피전문점 부문 수상', 'RTD 캔커피 편의점 유통망 확대'] },
    { year: '2022', items: ['나다커피 물류 센터 전국 거점 확대', '자체 원두 품질 연구소(R&D) 설립', '가맹점 상생 협력 우수 기업 선정'] },
    { year: '2021', items: ['가맹점 1,500호점 돌파', '비대면 키오스크 시스템 전 매장 도입', '홈카페 전용 원두 및 굿즈 라인업 런칭'] },
    { year: '2020', items: ['나다커피 브랜드 공식 런칭', '제1 로스팅 팩토리 가동 시작', '가맹사업 개시 및 100호점 동시 오픈'] },
    { year: '2018', items: ['스페셜티 원두 수입 및 유통 사업 확장', '커피 로스팅 기술 특허 출원', 'B2B 원두 납품 서비스 개시'] },
    { year: '2015', items: ['나다 커피 아카데미 설립', '바리스타 교육 및 전문가 양성 프로그램 운영', '수도권 주요 상권 팝업 스토어 운영'] },
    { year: '2012', items: ['프리미엄 원두 블렌딩 연구소 설립', '전 세계 산지 직거래(Direct Trade) 시스템 구축', '로스팅 설비 고도화 및 대량 생산 체계 마련'] },
    { year: '2009', items: ['나다커피 전신 ‘나다 로스터리’ 개인 매장 오픈', '지역 내 핸드드립 전문점으로 명성 확보', '원두 소량 판매 및 배송 서비스 시작'] },
    { year: '2006', items: ['나다커피 창업주 커피 연구 시작', '세계 커피 산지 탐방 및 생두 선별 기술 습득', '나다커피 브랜드 철학 정립'] },
  ];

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-[#222222]">
      <SEO
        title="브랜드 소개"
        description="나다커피의 브랜드 스토리, 핵심 가치, 로스팅 팩토리를 소개합니다. 2006년부터 이어온 나다커피의 철학을 만나보세요."
        keywords="나다커피 브랜드, 브랜드 소개, 나다커피 역사, 로스팅 팩토리"
      />

      {/* SECTION 1: HERO */}
      <section className="relative h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-[100px] font-black text-white italic tracking-tighter leading-none" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            ENJOY THE <br /> <span className="text-[#FFD400]">NADA COFFEE</span>
          </motion.h1>
        </div>
      </section>

      {/* SECTION 2: BRAND IDENTITY */}
      <section className="py-24 md:py-40 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src={identityImg} alt="Identity" className="h-24 md:h-32 mx-auto mb-12 object-contain" />
            <h2 className="text-3xl md:text-[42px] font-black text-[#222222] mb-8 tracking-tight">BRAND IDENTITY</h2>
            <div className="w-12 h-[3px] bg-[#FFD400] mx-auto mb-12" />
            <p className="text-[#666666] text-base md:text-[20px] lg:text-[22px] leading-[1.8] max-w-5xl mx-auto font-medium break-keep">
              나다커피는 2020년 런칭하여 본사 자체 로스팅 공장을 기반으로 <br className="hidden md:block" />
              최상의 원두를 합리적인 가격으로 제공하며 고객의 일상에 즐거움을 더하는 브랜드입니다. <br className="hidden md:block" />
              우리는 단순한 커피 전문점을 넘어, 대한민국 커피 문화의 새로운 기준을 제시합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: BRAND COLOR */}
      <section className="py-24 bg-[#F9F9F9]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h3 className="text-2xl md:text-[32px] font-black text-[#222222] text-center mb-16 tracking-tight">BRAND COLOR</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#EEEEEE]">
              <div className="w-full h-48 mb-8 overflow-hidden rounded-lg"><img src={colorImg1} className="w-full h-full object-cover" alt="Yellow" /></div>
              <h4 className="text-[20px] font-black text-[#222222] mb-3">NADA YELLOW</h4>
              <p className="text-[#999999] text-[13px] font-bold leading-relaxed">활기차고 긍정적인 에너지의 상징</p>
            </div>
            <div className="bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#EEEEEE]">
              <div className="w-full h-48 mb-8 overflow-hidden rounded-lg"><img src={colorImg2} className="w-full h-full object-cover" alt="Black" /></div>
              <h4 className="text-[20px] font-black text-[#222222] mb-3">NADA BLACK</h4>
              <p className="text-[#999999] text-[13px] font-bold leading-relaxed">깊이 있는 전문성과 신뢰의 가치</p>
            </div>
            <div className="bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#EEEEEE]">
              <div className="w-full h-48 mb-8 overflow-hidden rounded-lg"><img src={colorImg3} className="w-full h-full object-cover" alt="White" /></div>
              <h4 className="text-[20px] font-black text-[#222222] mb-3">NADA WHITE</h4>
              <p className="text-[#999999] text-[13px] font-bold leading-relaxed">깨끗하고 정직한 품질의 약속</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CORE VALUE */}
      <section className="py-32 md:py-48 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-[42px] font-black text-[#222222] text-center mb-24 tracking-tight italic">CORE VALUE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12">
            <div className="text-center group">
              <div className="w-36 h-36 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-10 transition-colors duration-500 group-hover:bg-[#FFD400]">
                <svg className="w-16 h-16 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h4 className="text-[26px] font-black text-[#222222] mb-6 italic tracking-tighter">QUALITY</h4>
              <p className="text-[#666666] text-[15px] font-bold leading-[1.7] px-4 break-keep">엄선된 스페셜티 등급의 원두만을 사용하여 <br className="hidden lg:block" /> 최상의 맛을 유지합니다.</p>
            </div>
            <div className="text-center group">
              <div className="w-36 h-36 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-10 transition-colors duration-500 group-hover:bg-[#FFD400]">
                <svg className="w-16 h-16 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-[26px] font-black text-[#222222] mb-6 italic tracking-tighter">PRICE</h4>
              <p className="text-[#666666] text-[15px] font-bold leading-[1.7] px-4 break-keep">거품을 뺀 합리적인 가격으로 <br className="hidden lg:block" /> 누구나 부담 없이 즐기는 커피 문화를 만듭니다.</p>
            </div>
            <div className="text-center group">
              <div className="w-36 h-36 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-10 transition-colors duration-500 group-hover:bg-[#FFD400]">
                <svg className="w-16 h-16 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="text-[26px] font-black text-[#222222] mb-6 italic tracking-tighter">FRESHNESS</h4>
              <p className="text-[#666666] text-[15px] font-bold leading-[1.7] px-4 break-keep">자체 로스팅 공장을 통한 당일 로스팅 시스템으로 <br className="hidden lg:block" /> 신선함을 약속합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ROASTING FACTORY */}
      <section className="py-24 md:py-40 bg-[#222222] text-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 space-y-10">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h3 className="text-4xl md:text-[56px] font-black italic tracking-tighter leading-[1.1] mb-8">ROASTING <br /> FACTORY</h3>
                <div className="w-14 h-[3px] bg-[#FFD400] mb-10" />
                <p className="text-[#999999] text-base md:text-[18px] leading-[1.8] font-medium break-keep">
                  나다커피는 대규모 자체 로스팅 팩토리를 운영하여 <br className="hidden md:block" />
                  원두의 품질을 직접 관리합니다. <br /><br />
                  컴퓨터 제어 시스템을 통한 정밀한 로스팅으로 <br className="hidden md:block" />
                  사계절 내내 균일하고 깊은 맛의 커피를 생산하며, <br className="hidden md:block" />
                  전국 가맹점에 가장 신선한 상태의 원두를 공급합니다.
                </p>
              </motion.div>
            </div>
            <div className="flex-1 w-full">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <img src={factoryImg} alt="Factory" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* [NEW] SECTION 6: HISTORY - 컴포즈커피 연혁 섹션 완벽 클론 */}
      <section className="py-32 md:py-48 px-4 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-24">
            <h2 className="text-3xl md:text-[42px] font-black text-[#222222] tracking-tight italic">The History of NADA Coffee</h2>
            <div className="w-12 h-[3px] bg-[#FFD400] mx-auto mt-8" />
          </motion.div>

          <div className="relative">
            {/* 중앙 타임라인 선 */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-[#EEEEEE] md:-translate-x-1/2" />

            <div className="space-y-20">
              {historyData.map((data, index) => (
                <motion.div
                  key={data.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* 타임라인 포인트 */}
                  <div className="absolute left-0 md:left-1/2 top-2 w-3 h-3 bg-[#FFD400] rounded-full md:-translate-x-1/2 z-10 border-4 border-white shadow-sm" />

                  {/* 연도 표시 */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-20' : 'md:pr-20 text-left md:text-right'}`}>
                    <span className="text-4xl md:text-[56px] font-black text-[#222222] italic leading-none tracking-tighter">{data.year}</span>
                  </div>

                  {/* 상세 내역 */}
                  <div className={`w-full md:w-1/2 mt-4 md:mt-2 ${index % 2 === 0 ? 'md:pr-20 text-left md:text-right' : 'md:pl-20 text-left'}`}>
                    <ul className="space-y-3">
                      {data.items.map((item, i) => (
                        <li key={i} className="text-[#666666] text-sm md:text-[16px] font-bold leading-relaxed break-keep">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
