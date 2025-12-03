# 🛍️ EC Project — Full-Stack E-Commerce Application

React・Node.js・MongoDB を基盤とした EC サービスで、
**ユーザー向け Web ストア、管理者用ダッシュボード、API サーバー**で構成されたフルスタックプロジェクトです。


---

## ⭐ Overview

本プロジェクトは、実際の EC サービス運用を前提として設計されており、
**商品閲覧 → カート → 決済 → 注文管理 → 管理者運用**までの一連のフローを含んでいます。

ユーザー体験（UX）、パフォーマンス最適化、データ整合性、保守性を考慮して実装しています。


---

## 🚀 主な機能

- **ユーザー向けサービス（Frontend）**  
  - 商品閲覧、検索、お気に入り、カート、Stripe 決済、注文履歴の確認  
  - 未ログイン → ログイン切り替え時、カートデータを自動マージ  
  - Lazy Routing によるパフォーマンス最適化と SEO 対応" 

- **管理者システム（Admin）**  
  - 商品 CRUD 管理  
  - Cloudinary を利用した画像アップロード  
  - テーブルベースのデータ管理 UI  

- **バックエンド API（Server）**  
  - JWT 認証および保護された API 構成  
  - Product／User／Order の CRUD 処理  
  - Stripe 決済処理および Cloudinary への画像保存  


---

## 🧰 技術スタック

| 区分 | 技術 |
|------|------|
| Frontend | React（SPA）、React Router、Context API、Framer Motion、Helmet（SEO） |
| Backend | Node.js、Express、MongoDB（Mongoose）、JWT、Stripe |
| Admin | React、React Table、Axios |
| Infra / External | Render、MongoDB Atlas、Cloudinary |


---

## 📁 Project Structure

```
ecproject/
│
├─ frontend/      # ユーザー向けショッピングサイト
├─ admin/         # 管理者用管理画面
└─ backend/       # Node.js ベースの REST API サーバー

```

---

## 🔗 デプロイ URL

| システム | リンク |
|----------|--------|
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

## ▶ インストール & 実行方法

### ① Backend 

```sh
cd backend
npm install
npm start
```

### ② Frontend / Admin 

```sh
npm install
npm start / npm run dev
```

---

🎯 プロジェクト目的

> 本システムは、実サービスとしての運用を想定し、
> 拡張性・安定性・保守性を満たすアーキテクチャ設計と機能実装を目的として開発しました。

---



