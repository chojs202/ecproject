🛠 Admin Dashboard

商品データを管理するために構築した、React ベースの管理画面です。
CRUD を中心とした効率的なデータ管理フローと、視認性の高い UI を重視して設計しました。

---

⭐ Overview

Admin パネルは実際の運用を想定し、直感的に操作でき、入力ミスを防げるよう設計・開発しました。
商品登録や編集など、主要な管理機能を備えています。

---

## 🚀 機能

- 商品管理
  - 商品の登録・編集・削除
  - Cloudinary を使用した画像アップロード
  - Drag & Drop による画像並び替え

- **Data table UI**
  - ソート・検索・ページネーション

---

## 🧰 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | React（Vite環境） |
| Network | Axios を使用した REST API 連携 |
| UI Data Handling | React Table |
| Image Upload | Cloudinary Upload Widget |
| State | Local UI State |
| Deploy | Render |

---

## ⚙ Architecture & Implementation

### 🧩 設計基準（What & Why）

| 項目 | 説明 |
|------|------|
| 単一責任ビュー | 機能ごとに画面を分離し、保守性を向上 |
| テーブルベース UI | データ管理に最適化された設計 |
| フォームバリデーション | 商品管理時の入力エラーを最小化 |
| REST API 連携 | Backend と統一されたデータスキーマで運用 |

---

### 🔧 実装方式（How）

| 項目 | 目的 | 実装内容 |
|------|------|-----------|
| CRUD Form | 商品情報の入力・編集 | Controlled Components |
| Image Upload | 保存およびプレビュー機能 | Cloudinary Upload Widget |
| テーブル表示 | データの視認性と管理効率の向上 | React Table |
| API 連携 | サーバーデータの取得と反映 | Axios を使用した HTTP Client |
---

## 📁 Directory Structure

```
admin/
├─ public/               # 静的ファイル
├─ src/
│  ├─ assets/            # 画像・アイコンなど
│  ├─ Components/        # 再利用可能な UI コンポーネント
│  ├─ Pages/             # ルーティング対象ページ
│  ├─ App.jsx            # ルーティングおよびレイアウト
│  └─ main.jsx           # エントリーポイント
```


## ▶ 実行方法

```sh
npm install
npm run dev
```

---

## 📌 目的

> データを効率的に管理できるよう、
> **視認性、入力精度、保守性を考慮した管理ツールとして開発しました。**

