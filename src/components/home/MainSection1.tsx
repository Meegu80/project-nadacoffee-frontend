import React, { useState } from "react";
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
   const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
   const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

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
               prevEl,
               nextEl,
            }}
            slidesPerView={1}
            speed={800}
            autoplay={{
               delay: 6000,
               disableOnInteraction: false,
            }}
            loop={true}
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

         {/* 커스텀 네비게이션 버튼 - ref 대신 state를 사용하여 Swiper에 전달 */}
         <div 
            ref={(node) => setPrevEl(node)}
            className="custom-swiper-button-prev absolute top-1/2 left-[10px] -translate-y-1/2 w-20 h-20 z-10 cursor-pointer flex items-center justify-center transition-all hover:bg-black/25 hover:backdrop-blur-[2px] group"
         >
            <div className="w-6 h-6 border-t-4 border-r-4 border-white rotate-[-135deg] ml-1 group-active:scale-90 transition-transform"></div>
         </div>
         
         <div 
            ref={(node) => setNextEl(node)}
            className="custom-swiper-button-next absolute top-1/2 right-[10px] -translate-y-1/2 w-20 h-20 z-10 cursor-pointer flex items-center justify-center transition-all hover:bg-black/25 hover:backdrop-blur-[2px] group"
         >
            <div className="w-6 h-6 border-t-4 border-r-4 border-white rotate-[45deg] mr-1 group-active:scale-90 transition-transform"></div>
         </div>

         {/* Tailwind CSS로 스타일 대체 (style 태그 제거) */}
         <style dangerouslySetInnerHTML={{ __html: `
            .main-swiper .swiper-slide {
               width: 100% !important;
               height: 100% !important;
            }
            .main-swiper .swiper-button-next,
            .main-swiper .swiper-button-prev {
               display: none !important;
            }
         `}} />
      </section>
   );
};

export default MainSection1;
