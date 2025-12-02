# 🛍️ EC Project — Full-Stack E-Commerce Application

React, Node.js, MongoDB 기반의 전자상거래 서비스로  
**사용자 쇼핑 웹, 관리자 운영 시스템, API 서버**로 구성된 Full-Stack 프로젝트입니다.

---

## ⭐ Overview

본 프로젝트는 실제 커머스 서비스 환경을 기준으로 설계되었으며,  
**상품 탐색 → 장바구니 → 결제 → 주문 관리 → 관리자 운영**의 전체 흐름을 포함합니다.

사용자 경험(UX), 성능 최적화, 데이터 정합성, 유지보수 구조를 고려하여 구현되었습니다.

---

## 🚀 주요 기능

- **사용자 서비스 (Frontend)**  
  - 상품 조회, 검색, 찜, 장바구니, Stripe 결제, 주문 내역 조회  
  - 비회원 → 로그인 전환 시 장바구니 데이터 자동 병합  
  - Lazy Routing 기반 성능 최적화 및 SEO 대응  

- **관리자 시스템 (Admin)**  
  - 상품 CRUD, 주문 상태 변경, 사용자 목록 확인  
  - Cloudinary 이미지 업로드  
  - 테이블 기반 데이터 관리 UI  

- **백엔드 API (Server)**  
  - JWT 인증 및 보호된 API 구조  
  - Product / User / Order CRUD  
  - Stripe 결제 처리 및 Cloudinary 이미지 저장  

---

## 🧰 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React, Vite, React Router, Context API, Framer Motion, Helmet |
| Backend | Node.js, Express, MongoDB(Mongoose), JWT, Stripe |
| Admin | React, React Table, Axios |
| Infra / External | Render Hosting, MongoDB Atlas, Cloudinary |

---

## 📁 Project Structure

```
ecproject/
│
├─ frontend/      # 사용자 쇼핑 웹
├─ admin/         # 관리자 운영 화면
└─ backend/       # Node.js REST API 서버
```

---

## 🔗 배포 URL

| 시스템 | 링크 |
|--------|------|
| Frontend | https://ecproject-main.onrender.com |
| Admin Dashboard | https://ecproject-admin.onrender.com |
| Backend API | https://ecproject-backend.onrender.com |

---

## ⚙️ System Architecture

```
User (Web / Mobile)
            ↓
      Frontend (React)
            ↓
      REST API (Express)
            ↓
       MongoDB Atlas
            ↳ Stripe Payment
            ↳ Cloudinary Image Storage
```

---

## ▶ 설치 및 실행

### ① Backend 실행

```sh
cd backend
npm install
npm start
```

### ② Frontend / Admin 실행

```sh
npm install
npm start / npm run dev
```

---

## 🎯 프로젝트 목적

> 단순 기능 구현을 넘어, 실제 서비스 환경에 맞춘  
> **확장성 · 안정성 · 유지보수성 중심의 e-Commerce 시스템 구축**을 목표로 했습니다.

---



