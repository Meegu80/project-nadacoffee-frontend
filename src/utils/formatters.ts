/**
 * 가격을 한국 원화 형식으로 포맷팅합니다.
 * @param price - 포맷팅할 가격
 * @returns 포맷팅된 가격 문자열 (예: "1,000원")
 */
export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ko-KR')}원`;
};

/**
 * ISO 날짜 문자열을 한국 형식으로 포맷팅합니다.
 * @param dateString - ISO 형식의 날짜 문자열
 * @param includeTime - 시간 포함 여부 (기본값: false)
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}.${month}.${day} ${hours}:${minutes}`;
    }

    return `${year}.${month}.${day}`;
};

/**
 * 전화번호를 포맷팅합니다.
 * @param phone - 포맷팅할 전화번호
 * @returns 포맷팅된 전화번호 (예: "010-1234-5678")
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
};

/**
 * 상대 시간을 반환합니다 (예: "3일 전", "2시간 전")
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 상대 시간 문자열
 */
export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}일 전`;
    if (diffHour > 0) return `${diffHour}시간 전`;
    if (diffMin > 0) return `${diffMin}분 전`;
    return '방금 전';
};
