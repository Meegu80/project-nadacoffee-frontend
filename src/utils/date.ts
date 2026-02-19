import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일

dayjs.locale('ko');

// 날짜 포맷 (예: 2024.03.15)
export const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY.MM.DD');
};

// 날짜 + 시간 포맷 (예: 2024.03.15 14:30)
export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('YYYY.MM.DD HH:mm');
};

// 상대 시간 (예: 3일 전)
export const fromNow = (date: string | Date) => {
  return dayjs(date).fromNow();
};
