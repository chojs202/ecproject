# 🛠 Admin Dashboard

관리자가 상품·주문·사용자 데이터를 운영할 수 있도록 제작된 React 기반 관리자 페이지입니다.  
CRUD 중심의 효율적인 데이터 관리 workflow와 UI 가독성을 우선하여 설계되었습니다.

---

## ⭐ Overview

Admin 패널은 실제 운영 환경을 고려해 **직관적인 데이터 관리와 최소한의 입력 오류를 목표**로 제작되었습니다.  
상품 등록·수정, 주문 상태 변경, 회원 관리 등 주요 운영 기능을 포함합니다.

---

## 🚀 주요 기능

- **상품 관리**
  - 상품 등록 / 수정 / 삭제
  - Cloudinary 기반 이미지 업로드
  - Drag & Drop 이미지 순서 조정

- **데이터 테이블 UI**
  - 정렬 / 검색 / 페이징

---

## 🧰 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | React (Vite 환경) |
| Network | Axios 기반 REST API 연동 |
| UI Data Handling | React Table |
| Image Upload | Cloudinary Upload Widget |
| State | Local UI State 기반 |
| Deploy | Render |

---

## ⚙ Architecture & Implementation

### 🧩 설계 기준 (What & Why)

| 구성 요소 | 설명 |
|-----------|------|
| 단일 책임 View | 기능별 화면 분리로 유지보수성 개선 |
| 테이블 기반 UI | 데이터형 서비스에 최적화된 구조 |
| 폼 검증 | 상품 관리 시 입력 오류 최소화 |
| 외부 자원 처리 | 이미지와 결제 정보의 외부 저장 전략 적용 |
| REST API 통신 | Backend와 일관된 데이터 스키마 연동 |

---

### 🔧 구현 방식 (How)

| 구성 요소 | 목적 | 적용 방식 |
|-----------|------|-----------|
| CRUD Form | 상품 정보 입력·수정 처리 | Controlled Form 방식 |
| Image Upload | 이미지 저장 및 미리보기 제공 | Cloudinary Upload Widget |
| Table 기반 데이터 표시 | 데이터 가독성 및 관리 편의성 | React Table |
| API 연동 | 서버 데이터 요청 및 상태 반영 | Axios 기반 HTTP Client |
| Access Control | 관리자 기능 접근 제어 | 인증 사용자 전용 UI |

---

## 📁 Directory Structure

```
admin/
├─ public/               # 정적 파일
├─ src/
│  ├─ assets/            # 이미지, 아이콘 등
│  ├─ Components/        # 재사용 UI 컴포넌트
│  ├─ Pages/             # 라우팅되는 화면 단위
│  ├─ App.jsx            # 전체 라우팅 및 Layout
│  └─ main.jsx           # 엔트리 포인트
└─ .env                  # 환경 변수
```


## ▶ 실행 방법

```sh
npm install
npm run dev
```

---

## 📌 목적

> 운영자가 데이터를 효율적으로 관리할 수 있도록,  
> **가독성과 입력 유효성, 유지보수성을 고려한 관리자 도구를 구축하는 것이 목표였습니다.**

