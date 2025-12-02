# 🛒 Frontend — User Web Store

사용자가 상품을 탐색하고 구매할 수 있는 React 기반 쇼핑몰 웹 인터페이스입니다.  
UX 흐름, 성능 최적화, 유지보수 구조, SEO 대응을 고려하여 개발되었습니다.

---

## ⭐ Overview

본 프론트엔드는 다음 요구사항을 충족하도록 설계되었습니다:

- 상품 탐색 → 상세 → 장바구니 → 결제 → 주문 내역까지의 완결된 사용자 플로우
- SPA 기반에서 발생하는 SEO·로딩·전환 UX 문제 해결
- 모바일, 태블릿, 데스크톱 환경 모두 대응 가능한 반응형 레이아웃

---

## 🚀 주요 기능

- 상품 목록, 상세 보기, 카테고리/검색 기반 필터링
- 장바구니 및 찜 기능(비회원 저장 포함)
- 로그인 후 **Local → DB로 장바구니 자동 병합**
- Stripe 결제, 주문 생성 및 주문 내역 조회
- 사용자 계정: 회원가입 / 로그인 / 정보 수정 / 비밀번호 변경
- Lazy-load 기반 라우팅 및 페이지 전환 애니메이션 적용

---

## 🧩 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | React (Vite) |
| Architecture | SPA |
| Routing | React Router |
| State Management | Context API |
| UI/UX Interaction | Framer Motion, Skeleton Loader |
| SEO 대응 | react-helmet-async |
| Assets | Cloudinary |
| Network | REST API 요청 기반 |
| Deploy | Render |

---

## ⚙️ Architecture & 설계 기준

| 구성 요소 | 설명 |
|----------|------|
| **Lazy Routing + Code Splitting** | 초기 번들 크기 감소 및 체감 성능 개선 |
| **Global Frontend Structure** | SEO·로딩 UI·페이지 전환·레이아웃 유지 통합 관리 |
| **Session 기반 Intro Loading** | 초기 로딩 UX 강화 및 첫 방문 시 브랜드 경험 제공 |
| **Persistent Layout** | Navbar / Footer 유지로 탐색 중 맥락 유지 |
| **Responsive UI** | 모바일 중심 UI 설계 → Desktop 확장형 |

---

## 📦 Data Flow

```
User Action
   ↓
React View Layer
   ↓
Context State (Auth / Cart / Like)
   ↓
Backend REST API
   ↓
MongoDB (User / Product / Order)
   ↳ Stripe 결제 처리
   ↳ Cloudinary 이미지 로딩
```

---

## 📁 프로젝트 구조

```
frontend/
│
├─ public/                 # 정적 리소스
│
├─ src/
│   ├─ Components/         # UI 컴포넌트
│   ├─ Context/            # 전역 상태 관리 (Auth, Cart, Like 등)
│   ├─ Pages/              # 라우트 페이지
│   ├─ App.js              # 라우팅 및 전역 레이아웃 구조
│   └─ index.js            # 애플리케이션 엔트리 포인트
│
├─ package.json
└─ README.md
```

---

## ▶ 실행 방법

```sh
npm install
npm start
```

---

## 🎯 목적

> **사용자의 구매 경험을 빠르고 자연스럽게 연결하며, 운영 환경에서 유지보수성과 확장성을 고려한 Frontend 구현.**
