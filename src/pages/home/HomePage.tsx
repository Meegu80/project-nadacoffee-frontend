import MainSection1 from "../../components/home/MainSection1";
import MainSection2 from "../../components/home/MainSection2";
import MainSection3 from "../../components/home/MainSection3";
import SEO from "../../components/common/SEO"; // [추가]

function HomePage() {
   return (
      <div className="w-full overflow-x-hidden">
         {/* [추가] 메인 페이지 SEO 설정 */}
         <SEO title="홈" description="프리미엄 원두와 깊은 풍미, 나다커피 공식 온라인 스토어입니다." />
         
         <MainSection1 />
         <MainSection2 />
         <MainSection3 />
      </div>
   );
}

export default HomePage;
