
🛍️ E-Commerce Project (Full-Stack)

본 프로젝트는 사용자 쇼핑몰(Frontend), 관리자(Admin Dashboard), REST API Backend로 구성된 전자상거래 서비스입니다.
상품 관리부터 주문·결제·사용자 인증까지 포함한 end-to-end 구조로 설계되었습니다.

📂 프로젝트 구조
ecproject/
│─ frontend/   → 사용자 쇼핑몰
│─ admin/      → 관리자 대시보드
│─ backend/    → Node.js API 서버
│─ README.md   → 전체 설명

🧭 주요 기능

회원가입 / 로그인 / 사용자 정보 수정

상품 목록, 상세, 검색, 카테고리 필터

장바구니, 찜, 할인 코드 적용

Stripe 기반 결제 및 주문 내역 관리

관리자 상품/주문/사용자 운영 기능 포함

⚙️ 기술 스택

영역	사용 기술
Frontend :	React, Vite, Context API, React Router, Framer Motion
Admin :	React, React Table, Cloudinary
Backend :	Node.js, Express, MongoDB, JWT, Stripe
기타 :	Cloudinary, Render Hosting, MongoDB Atlas

🌐 배포 주소
용도	링크
Frontend	https://ecproject-main.onrender.com

Admin	https://ecproject-admin.onrender.com

API	https://ecproject-backend.onrender.com

📦 설치 및 실행
# backend
cd backend
npm install
npm start

# frontend / admin
npm install
npm start / npm run dev
