# ☕ NadaCoffee Frontend Project

나다커피(NadaCoffee)는 프리미엄 원두와 차별화된 풍미를 제공하는 로스터리 전문 쇼핑몰입니다. 본 프로젝트는 사용자 친화적인 인터페이스와 안정적인 커머스 기능을 제공하는 것을 목표로 합니다.

## 🛠 Tech Stack

- **Framework:** React 18 (with Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **State Management:** Zustand (Local), TanStack Query v5 (Server)
- **Icons:** Lucide React, React Icons
- **Editor:** Tiptap Web Editor

## 📅 Development Timeline

### Phase 1: Foundation (Jan 2026)
- 프로젝트 초기 환경 설정 및 폴더 구조 설계.
- JWT 기반 사용자 인증 시스템 구축 (로그인, 회원가입).
- 공통 레이아웃(Header, Footer) 및 기본 테마 적용.

### Phase 2: Core Commerce (Early Feb 2026)
- **메인 페이지:** 브랜드 아이덴티티를 강조한 섹션 구성.
- **메뉴 시스템:** 카테고리별 상품 목록 및 검색 기능.
- **상품 상세:** 옵션 선택(HOT/ICE), 실시간 가격 계산, 상품 상태 배지(NEW, HOT, SOLD OUT).
- **매장 찾기:** 카카오 맵 API 연동 및 매장 검색 기능.

### Phase 3: Admin & Payments (Feb 5 - Feb 9)
- **관리자 패널:** 대시보드, 회원 관리, 카테고리 및 상품 관리 시스템 구축.
- **결제 시스템:** 토스페이먼츠(Toss Payments) 연동 및 결제 성공/실패 처리.
- **리뷰 시스템:** 구매 확정 후 리뷰 작성 및 별점 기능.

### Phase 4: Optimization & Refinement (Feb 11 - Feb 12)
- **장바구니 고도화:** 
  - 서버 데이터 동기화 로직 개선 (Server ID 기반 삭제/수정).
  - 장바구니 비우기 기능 및 개별 삭제 안정화.
  - 시인성 개선 (목록 투명도 제거, 헤더 텍스트 강화).
- **1:1 문의 시스템:** 
  - 고객 문의 등록/수정/삭제(CRUD) 및 이미지 첨부 기능.
  - 관리자 답변 등록 및 상태 관리 시스템 연동.
- **관리자 기능 강화:** 
  - 상품 등록 시 최대 5장 다중 이미지 업로드 지원.
  - 페이지네이션 상태 유지 (수정 후 이전 페이지로 복귀).
- **GNB 최적화:** 화면 폭에 따른 유연한 메뉴 간격 조정 및 반응형 레이아웃 적용.

## 🚀 Current Focus: Data Standardization
현재 233개의 기존 상품 데이터를 보존하면서, 다중 이미지(`imageUrls`)와 정교한 옵션 체계를 지원하기 위한 **백엔드 DB 구조 개편 및 데이터 마이그레이션**을 준비 중입니다.

---
*Last Updated: 2026-02-12*
