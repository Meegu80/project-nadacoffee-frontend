// 공통 응답 규격
export interface ApiResponse<T> {
    message: string;
    data: T;
}

// 공통 유저 프로필
export interface UserProfile {
    id: number;
    email: string;
    name: string;
    phone: string;
    grade: string;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

// 회원가입 시 보낼 데이터 (백엔드 명세에 맞춤)
export interface UserCreateRequest {
    email: string;
    password: string;
    password_confirm: string; // 스네이크 케이스 적용
    name: string;
    phone: string;
    role?: string;
}

// 로그인 데이터
export interface AuthData {
    token: string;
    user: UserProfile;
}

// 응답 타입 별칭
export type SignUpResponse = ApiResponse<UserProfile>;
export type LoginResponse = ApiResponse<AuthData>;
