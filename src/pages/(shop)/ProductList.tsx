function ProductList() {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">상품 목록</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* 상품 아이템 예시 */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">상품 이미지</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">프리미엄 원두 {item}</h3>
              <p className="text-gray-600">15,000원</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
