// 금액 포맷팅 함수 테스트 예시
const formatPrice = (price: number) => `₩ ${price.toLocaleString()}`;

describe('Price Formatting Utility', () => {
  test('숫자를 원화 형식 문자열로 변환해야 함', () => {
    expect(formatPrice(10000)).toBe('₩ 10,000');
    expect(formatPrice(0)).toBe('₩ 0');
  });
});
