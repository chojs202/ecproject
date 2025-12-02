# 🧩 Backend — REST API Server

Node.js(Express) 기반의 RESTful API 서버로,  
사용자 인증, 상품 데이터 관리, 장바구니/찜 기능, 결제 처리(Stripe), 주문 관리 기능을 제공합니다.

---

## ⭐ Overview

본 백엔드는 프론트엔드와 독립적으로 동작하며,  
**JWT 인증 · Stripe 결제 · Cloudinary 이미지 저장 · CRUD 데이터 처리**가 핵심 역할입니다.

---

## 🚀 주요 기능

- **JWT 기반 인증**
  - 회원가입, 로그인, 토큰 검증 및 보호된 API 접근 제어

- **상품 / 주문 / 사용자 데이터 처리**
  - Mongoose 모델 기반 CRUD 구조

- **장바구니 및 찜 목록 관리**
  - 로그인 전·후 데이터 정합성 유지

- **Stripe 결제 연동**
  - PaymentIntent 기반 결제 요청 및 승인 처리

- **Cloudinary 연동**
  - 이미지 업로드 및 외부 저장 처리

---

## 🧰 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Payment | Stripe |
| Storage | Cloudinary |
| Validation | Express Middleware 기반 |

---

## ⚙️ Architecture & Implementation

### 🧩 설계 기준 (What & Why)

| 구성 요소 | 설명 |
|-----------|------|
| RESTful API 설계 | 클라이언트와 명확한 엔드포인트 기반 통신 구조 |
| JWT 인증 방식 | 상태 비저장 인증 처리로 서버 부담 최소화 |
| Modular Layering | 유지보수성과 확장성 고려한 레이어 분리 |
| Schema 기반 모델링 | 데이터 일관성과 안정성 확보 |
| 외부 서비스 연동 | Cloudinary, Stripe 등 클라우드 기반 확장 대응 |

---

### 🔧 구현 방식 (How)

| 구성 요소 | 목적 | 적용 방식 |
|-----------|------|-----------|
| Routing 분리 | 기능 단위 API 구조화 | `/routes/*` 기반 |
| Controller Layer | 비즈니스 로직 분리 | `/controllers/*` |
| JWT Middleware | 인증/인가 처리 | `middlewares/auth.js` |
| Error Handling | 일관된 예외 처리 | 글로벌 미들웨어 |
| Stripe Payment | 결제 요청 처리 | PaymentIntent 기반 처리 |
| Image Upload | 외부 저장 기반 관리 | Cloudinary + Multer |

---

## 🔗 Data Flow Overview

```
Client Request
     ↓
Express Router
     ↓
Controllers (Logic Processing)
     ↓
MongoDB (Mongoose Models)
        ↳ Stripe Payment Execution
        ↳ Cloudinary Image Storage
```

---

## 📁 Directory Structure

```
backend/
│
├─ controllers/        # 요청 처리 비즈니스 로직
├─ middlewares/        # 인증 및 공통 처리 미들웨어
├─ models/             # Mongoose Schema/Model
├─ routes/             # REST API Endpoint 정의
│
├─ index.js            # 서버 엔트리 포인트
│
├─ package.json
└─ README.md
```

### Directory Notes

| 항목 | 설명 |
|------|------|
| `controllers/` | API 동작 로직 분리(읽기/변경/검증) |
| `middlewares/` | JWT 인증, 에러 처리 등 공통 처리 |
| `models/` | MongoDB 데이터 스키마 정의 |
| `routes/` | 기능별 API endpoint 집합 |
| `index.js` | 서버 구동, DB 연결, 라우팅 등록 |


---

## ▶ 실행 방법

```sh
npm install
npm start
```
