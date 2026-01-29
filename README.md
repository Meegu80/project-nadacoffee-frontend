# 📊 나다커피(Nada Coffee) 프로젝트 현황 보고서

본 문서는 현재까지 진행된 나다커피 프론트엔드 프로젝트의 완성도와 구현된 주요 기능, 그리고 **오늘의 작업 내역 및 향후 계획**을 정리한 보고서입니다.

---

## 1. 프로젝트 개요
- **프로젝트명**: 나다커피(Nada Coffee) 프론트엔드 리뉴얼
- **기술 스택**: React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, TanStack Query, Framer Motion

---

## 2. 📅 오늘의 작업 내역 (2026.01.28)

### ✅ 관리자 페이지 고도화 (Admin) - 완성도: 75%
- **회원 관리**: TanStack Query를 활용한 회원 목록 조회, 상세 조회, 신규 등록, 수정, 삭제(CRUD) 기능 완벽 구현.
- **카테고리 관리**: 계층형(Tree) 카테고리 구조 조회 및 등록/수정/삭제 기능 구현. 라우터 기반 핵심 카테고리 가이드 추가.
- **대시보드**: 매출 통계, 주문 현황, 재고 알림, 빠른 작업을 포함한 실무형 대시보드 UI 구축.

### ✅ 사용자 마이페이지 기초 (My Page) - 완성도: 60%
- **내 정보 조회**: `GET /api/members/me` API 연동을 통한 프로필 정보 렌더링 완료.
- **네비게이션**: "MY" 아이콘 호버 시 나타나는 중앙 정렬 드롭다운 메뉴 구현.
- **API 연동**: 정보 수정(`PUT`) 및 비밀번호 변경(`PATCH`) API 통신 로직(`member.api.ts`) 작성 완료.

### ✅ 인프라 및 환경 설정
- **카카오맵**: API 키 갱신 및 `react-kakao-maps-sdk` 도입을 통한 지도 로딩 안정화 완료.
- **Vite 설정**: HTML 내 환경 변수 치환을 위한 커스텀 플러그인 적용 및 프록시 설정 최적화.
- **TanStack Query**: 전역 `QueryClientProvider` 설정 및 Mutation 로직 강화.

---

## 3. ⚠️ 보완할 점 및 이슈 사항
- **컴포넌트 안정성**: `MyPageEdit` 및 `ChangePassword` 페이지 적용 시 발생한 빌드/렌더링 이슈 해결 필요 (현재 안정적인 '내 정보 조회' 상태로 롤백됨).
- **에러 핸들링**: 404 에러 및 API 호출 실패 시 사용자에게 보여줄 전역 에러 바운더리(Error Boundary) 미비.
- **UI 디테일**: 드롭다운 메뉴의 애니메이션 및 모바일 환경에서의 터치 인터랙션 미세 조정 필요.

---

## 4. 🚀 내일의 작업 계획 (Next Steps)

### 1순위: 마이페이지 기능 완성 및 안정화
- `MyPageEdit.tsx` 및 `ChangePassword.tsx` 파일의 `export default` 및 임포트 구조 재점검.
- 정보 수정 및 비밀번호 변경 후 자동 로그아웃 또는 데이터 갱신 로직 최종 확인.

### 2순위: 상품 시스템 엔지니어링 (Day 1 로드맵 재개)
- **상품 상세 페이지**: 옵션 선택(Hot/Ice, 사이즈)에 따른 실시간 가격 계산 엔진 구현.
- **영양성분 표**: 상품별 영양성분 및 알레르기 정보 탭 구현.

### 3순위: 장바구니 시스템 착수
- Zustand를 활용한 장바구니 전역 상태 설계.
- 상품 상세 페이지에서 장바구니 담기 시 로컬 스토리지 동기화 로직 구현.

---

# ☕ 나다커피(Nada Coffee) 프로젝트 로드맵

본 문서는 나다커피 프론트엔드 고도화를 위한 **7일간의 집중 개발 스프린트(Sprint)** 계획과 기술 명세를 담고 있습니다.

---

## 🚀 Day 1: 마이페이지 안정화 및 상품 시스템 엔지니어링

오늘 발생한 렌더링 이슈를 해결하고, 실제 주문이 가능한 **커머스 핵심 로직**을 구축하는 날입니다.

### 1. 업무 프로세스 (Professional Workflow)

#### **[Phase 0] 마이페이지 기능 복구 및 안정화 (09:00 ~ 10:30)**
- **목표**: `MyPageEdit` 및 `ChangePassword` 페이지의 렌더링 오류 해결
- **작업**: 
  - `export default` 누락 확인 및 임포트 경로 정밀 점검
  - 정보 수정 및 비밀번호 변경 후 데이터 동기화(Invalidate) 로직 최종 확인
  - 네비게이션 드롭다운 메뉴의 위치 및 애니메이션 최적화

#### **[Phase 1] 상품 데이터 모델링 및 타입 정의 (10:30 ~ 12:00)**
- **목표**: 상품이 가질 수 있는 모든 속성을 정의하여 타입 안정성 확보
- **작업**: `src/types/product.ts` 생성 및 인터페이스 정의
  - `ProductOption`: 온도(Hot/Ice), 사이즈(Regular/Large), 추가(샷, 시럽 등)
  - `NutritionInfo`: 칼로리, 당류, 단백질, 카페인 함량 등

#### **[Phase 2] UI 아키텍처 설계 및 컴포넌트 구현 (13:00 ~ 15:00)**
- **Visual Section**: `Swiper.js`를 활용한 상품 멀티 이미지 슬라이더
- **Selection Section**: 
  - 온도 선택(Tab), 사이즈 선택(Card) UI 구현
  - 수량 조절 컴포넌트(`QuantityStepper`) 연동
- **Info Section**: `AnimatePresence` 기반 탭 메뉴(상세설명/영양성분/리뷰)

#### **[Phase 3] 비즈니스 로직 및 상태 관리 (15:00 ~ 17:00)**
- **Price Engine**: 옵션 선택에 따른 실시간 합계 금액 계산 (`useMemo` 활용)
- **Filtering Logic**: URL Query String 연동 필터링 및 정렬(가격순, 이름순)
- **Search Logic**: `useDebounce` 훅을 통한 최적화된 상품 검색 엔진

#### **[Phase 4] QA 및 예외 처리 (17:00 ~ 18:30)**
- **Edge Cases**: 존재하지 않는 상품 ID 접근 시 404 유도
- **Responsive**: 모바일 하단 고정 구매 바(Sticky Bar) 최적화
- **Performance**: 이미지 Lazy Loading 및 리렌더링 방지(`React.memo`)

---

### 2. 기술 명세 (Technical Spec)

#### **A. 핵심 데이터 구조**
```typescript
export interface Product {
  id: string;
  name: string;
  nameEng: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'SEASON_ONLY';
  options: {
    temperatures: ('HOT' | 'ICE')[];
    sizes: { name: string; extraPrice: number }[];
    additions: { name: string; price: number }[];
  };
  nutrition: {
    calories: number;
    sugar: number;
    caffeine: number;
    sodium: number;
  };
}
```

---

## 📅 7-Day 전체 일정 요약

| 날짜 | 목표 | 주요 작업 내용 |
| :--- | :--- | :--- |
| **Day 1** | **마이페이지 & 상품 시스템** | 마이페이지 안정화, 상세 페이지 옵션 로직, 영양성분 표 |
| **Day 2** | **장바구니 & 상태 관리** | Zustand 기반 장바구니 CRUD, 로컬 스토리지 동기화, 토스트 알림 |
| **Day 3** | **결제 시스템 통합** | Checkout 페이지, 토스페이먼츠 SDK 연동, 결제 결과 처리 |
| **Day 4** | **지원 기능 강화** | 카카오맵 API 매장 검색, 고객의 소리 폼 유효성 검사 및 API 연동 |
| **Day 5** | **관리자 상품 관리** | 상품/카테고리 CRUD, 이미지 업로드 처리, 노출 설정 |
| **Day 6** | **관리자 운영 관리** | 회원 목록 관리, 주문 상태 변경 로직, 매출 통계 기초 |
| **Day 7** | **최적화 & QA** | 스켈레톤 UI, 애니메이션 최적화, 에러 바운더리, 최종 배포 테스트 |

---

## 🛠 개발 준비물 (Prerequisites)
- **API Keys**: `VITE_KAKAO_MAP_KEY`, `VITE_TOSS_CLIENT_KEY`
- **Assets**: 상품 고해상도 이미지, 영양성분 데이터셋(JSON)
- **Libraries**: `swiper`, `framer-motion`, `lucide-react`, `react-hook-form`, `@tanstack/react-query`, `zustand`

---
**최종 업데이트**: 2026년 1월 28일
**작성자**: Nada Coffee Dev Team
