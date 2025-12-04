# 🛒 Frontend — User Web Store

ユーザーが商品を閲覧し、購入できるように構築した React ベースのショッピングサイトです。
UX の導線設計、パフォーマンス最適化、保守性の高い構造、SEO 対応を考慮して開発しました。


---

## ⭐ Overview

本フロントエンドは、以下の要件を満たすよう設計されています

- 商品閲覧 → 詳細ページ → カート → 決済 → 注文履歴まで完結するユーザーフロー
- SPA における SEO・初期ロード・画面遷移の UX 課題へ対応
- モバイル・タブレット・デスクトップに対応したレスポンシブレイアウト


---

## 🚀 主な機能

- 商品一覧、商品詳細、カテゴリ／検索ベースのフィルタリング
- カートおよびお気に入り機能（未ログイン時のローカル保存に対応）
- ログイン時、ローカルデータ → DB への自動マージ
- Stripe を使用した決済処理、注文作成、注文履歴の確認
- アカウント管理：新規登録／ログイン／情報編集／パスワード変更
- Lazy Load を用いたルーティングおよびページ遷移アニメーション


---

## 🧩 技術スタック

| カテゴリ | 技術 |
|-----------|------|
| Framework | React |
| Architecture | SPA（Single Page Application） |
| Routing | React Router |
| State Management | Context API |
| UI／UX Interaction | Framer Motion、Skeleton Loader |
| SEO 対応 | react-helmet-async |
| Network | REST API ベースの通信 |
| Deploy | Render |


---

## ⚙️ Architecture & Implementation

以下は、本フロントエンドを設計する際に考慮した要素であり、
各項目は実際の実装内容と紐づいています。

---

### 🧩 設計基準（What & Why）

| 項目 | 説明 |
|------|------|
| Lazy Routing ＋ Code Splitting | 初期バンドルサイズを削減し、体感パフォーマンスを向上 |
| Global Frontend Structure | SEO・ローディング UI・ページ遷移・レイアウトを一元管理 |
| セッションベースのイントロローディング | 初回アクセス時のブランド体験とローディング UX を強化 |
| Persistent Layout | ナビゲーション中も Navbar／Footer を維持し、コンテキストを保持 |
| Responsive UI | Desktop-first 設計を基にレスポンシブスタイルを適用 |

---

### 🔧 実装方式（How）

| 項目 | 目的 | 実装内容 |
|------|------|-----------|
| Lazy Routing | 初期ロード時間の最適化 | `React.lazy + Suspense` |
| Global Layout Shell | 共通 UI を維持し、自然なページ遷移を実現 | Navbar／Footer を固定したレイアウト構造 |
| Intro Loading | 初回訪問時の UX 補助とローディング体感の軽減 | `sessionStorage` を利用し 1 回のみ表示 |
| SEO 対応 | SPA における検索インデックス課題を補完 |  `react-helmet-async` による動的メタタグ設定 |
| Cart Sync Logic | ログイン前後で一貫したショッピング体験を提供 | LocalStorage + DB 同期処理 |
| Responsive Layout | PC 中心の設計からモバイルへ最適化 | Desktop-first + Media Query |


---

## 📦 Data Flow

```
User Interaction
   ↓
UI Rendering (React)
   ↓
State Management (Context API + LocalStorage Sync)
   ↓
API Communication (Fetch → Express Server)
   ↓
Database (MongoDB)
      ↳ Payment (Stripe)
      ↳ Asset Storage (Cloudinary)
```

---

## 📁 プロジェクト構成

```
frontend/
│
├─ public/                 # 静的リソース
│
├─ src/
│   ├─ Components/         # UI コンポーネント
│   ├─ Context/            # グローバル状態管理（Auth・Cart・Like など）
│   ├─ Pages/              # ルーティング対象ページ
│   ├─ App.js              # ルーティングおよび全体レイアウト
│   └─ index.js            # アプリケーションのエントリーポイント
│
├─ package.json
└─ README.md
```

---

## ▶ 実行方法

```sh
npm install
npm start
```

---

## 🎯 目的

>本プロジェクトの目的は、ユーザーの購買導線をストレスなくつなぎ、
運用フェーズでの保守性・拡張性を備えたフロントエンドを構築することです。

