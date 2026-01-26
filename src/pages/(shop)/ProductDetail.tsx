import { useParams } from "react-router";

function ProductDetail() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-500 text-xl">상품 이미지 (ID: {id})</span>
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">프리미엄 원두 {id}</h1>
          <p className="text-2xl font-semibold text-indigo-600 mb-6">15,000원</p>
          <p className="text-gray-600 mb-8">
            깊은 풍미와 향긋한 아로마가 특징인 프리미엄 원두입니다. 신선하게 로스팅하여 보내드립니다.
          </p>
          <div className="flex gap-4">
            <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              장바구니 담기
            </button>
            <button className="flex-1 border border-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              바로 구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
