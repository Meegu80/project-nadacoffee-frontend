import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// 이미지 임포트
import img1 from "../../assets/cascade/1.jpg";
import img2 from "../../assets/cascade/2.jpg";
import img3 from "../../assets/cascade/3.jpg";
import img4 from "../../assets/cascade/4.jpg";

const MainSection1: React.FC = () => {
   const slides = [
      { img: img1, path: "/menu/frappe" },
      { img: img2, path: "/menu/frappe" },
      { img: img3, path: "/menu/tea" },
      { img: img4, path: "/news/event" },
   ];

   return (
      <section className="w-full h-[600px] md:h-[800px] bg-black overflow-hidden relative">
         <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
               prevEl: ".custom-swiper-button-prev",
               nextEl: ".custom-swiper-button-next",
            }}
            slidesPerView={1}
            speed={800}
            autoplay={{
               delay: 6000,
               disableOnInteraction: false,
            }}
            loop={true}
            touchRatio={1}
            resistanceRatio={0}
            className="w-full h-full main-swiper">
            {slides.map((slide, index) => (
               <SwiperSlide key={index}>
                  <Link
                     to={slide.path}
                     className="block w-full h-full cursor-pointer">
                     <div className="relative w-full h-full">
                        <img
                           src={slide.img}
                           alt={`Slide ${index + 1}`}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  </Link>
               </SwiperSlide>
            ))}
         </Swiper>

         {/* 커스텀 네비게이션 버튼 */}
         <div className="custom-swiper-button-prev">
            <div className="arrow-left"></div>
         </div>
         <div className="custom-swiper-button-next">
            <div className="arrow-right"></div>
         </div>

         <style>{`
        /* Swiper 슬라이드 고정 크기 */
        .main-swiper .swiper-slide {
          width: 100% !important;
          height: 100% !important;
          flex-shrink: 0;
        }

        .main-swiper .swiper-wrapper {
          transition-timing-function: ease-in-out !important;
        }

        /* 커스텀 네비게이션 버튼 컨테이너 */
        .custom-swiper-button-prev,
        .custom-swiper-button-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 80px;
          height: 80px;
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }

        .custom-swiper-button-prev {
          left: 10px;
        }

        .custom-swiper-button-next {
          right: 10px;
        }

        /* 호버 시 정사각형 음영 */
        .custom-swiper-button-prev:hover,
        .custom-swiper-button-next:hover {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(2px);
        }

        /* 화살표 스타일 - 사이즈 2배, bold 처리 */
        .arrow-left,
        .arrow-right {
          width: 24px;
          height: 24px;
          border-top: 4px solid white;
          border-right: 4px solid white;
        }

        .arrow-left {
          transform: rotate(-135deg);
          margin-left: 4px;
        }

        .arrow-right {
          transform: rotate(45deg);
          margin-right: 4px;
        }

        /* 모바일 반응형 */
        @media (max-width: 768px) {
          .custom-swiper-button-prev,
          .custom-swiper-button-next {
            width: 44px;
            height: 44px;
          }

          .arrow-left,
          .arrow-right {
            width: 16px;
            height: 16px;
            border-top: 3px solid white;
            border-right: 3px solid white;
          }
        }

        /* Swiper 기본 네비게이션 버튼 숨기기 */
        .main-swiper .swiper-button-next,
        .main-swiper .swiper-button-prev {
          display: none;
        }
      `}</style>
      </section>
   );
};

export default MainSection1;
