# 🧩 Backend — RESTful API Server

Node.js（Express）を使用した RESTful API サーバーで、  
ユーザー認証、商品データ管理、カート・お気に入り機能、Stripe を利用した決済処理、注文管理機能を提供しています。


---

## ⭐ Overview

本バックエンドはフロントエンドとは独立して動作し、  
JWT 認証、Stripe 決済、Cloudinary での画像保存、そして CRUD ベースのデータ処理を中心に役割を担っています。


---

## 🚀 主な機能

- **JWT ベースの認証**
  - 新規登録、ログイン、トークン検証、および保護された API へのアクセス制御

- **商品・注文・ユーザーデータ管理**
  - Mongoose モデルによる CRUD ベースのデータ構造

- **カートおよびお気に入り管理**
  - ログイン前後でデータ整合性を保持

- **Stripe 決済連携**
  - PaymentIntent を使用した決済リクエストおよび承認処理

- **Cloudinary 連携**
  - 画像アップロードおよび外部ストレージ処理


---

## 🧰 技術スタック

| カテゴリ | 技術 |
|----------|------|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Payment | Stripe |
| Storage | Cloudinary |
| Validation | Express Middleware ベース |


---

## ⚙️ Architecture & Implementation

### 🧩 設計基準（What & Why）

| 項目 | 説明 |
|------|------|
| RESTful API 設計 | クライアントと明確なエンドポイントで通信できる構造 |
| JWT 認証方式 | ステートレス認証によりサーバー負荷を軽減 |
| モジュール化レイヤリング | 保守性と拡張性を考慮したレイヤー分離 |
| スキーマベースのモデリング | データの一貫性と安定性を確保 |
| 外部サービス連携 | Cloudinary / Stripe などクラウドサービスに対応 |

---

### 🔧 実装方式（How）

| 項目 | 目的 | 実装内容 |
|------|------|-----------|
| ルーティング分離 | 機能単位で API を構造化 | `/routes/*` ベース |
| コントローラーレイヤー | ビジネスロジックを分離 | `/controllers/*` |
| JWT ミドルウェア | 認証／認可処理 | `middlewares/auth.js` |
| エラーハンドリング | 一貫した例外処理 | グローバルミドルウェア |
| Stripe 決済処理 | 決済リクエストの処理 | PaymentIntent ベース |
| 画像アップロード | 外部ストレージ管理 | Cloudinary + Multer |

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
├─ controllers/        # リクエスト処理のビジネスロジック
├─ middlewares/        # 認証および共通処理のミドルウェア
├─ models/             # Mongoose の Schema / Model
├─ routes/             # REST API エンドポイント定義
│
├─ index.js            # サーバーのエントリーポイント
│
├─ package.json
└─ README.md
```

### Directory Notes

| 項目 | 説明 |
|------|------|
| `controllers/` | API の処理ロジックを分離（読み取り／更新／検証） |
| `middlewares/` | JWT 認証やエラー処理などの共通処理 |
| `models/` | MongoDB のデータスキーマ定義 |
| `routes/` | 機能別の API エンドポイント群 |
| `index.js` | サーバー起動、DB 接続、ルーティング登録 |

---

## ▶ 実行方法

```sh
npm install
npm start
```
