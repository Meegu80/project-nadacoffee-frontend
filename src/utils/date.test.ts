import { formatDate, formatDateTime } from './date';
import dayjs from 'dayjs';

describe('Date Utility', () => {
    const testDate = '2024-03-24T10:00:00Z';

    test('날짜를 YYYY.MM.DD 형식으로 포맷해야 함', () => {
        const formatted = formatDate(testDate);
        expect(formatted).toBe('2024.03.24');
    });

    test('날짜와 시간을 YYYY.MM.DD HH:mm 형식으로 포맷해야 함', () => {
        const formatted = formatDateTime(testDate);
        // 타임존 케이스 대응을 위해 dayjs 직접 비교로 검증할 수도 있으나 기본 형식 체크
        expect(formatted).toMatch(/^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/);
    });

    test('유효하지 않은 날짜에 대해 Invalid Date를 반환해야 함', () => {
        const formatted = formatDate('invalid-date');
        expect(formatted).toBe('Invalid Date');
    });
});
