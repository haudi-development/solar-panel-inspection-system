# Solar Panel Inspection System

AIを活用したメガソーラーファーム向けパネル検査システム

## 概要

100,000枚規模のソーラーパネルを効率的に検査・管理するためのWebアプリケーション。熱画像解析により、ホットスポット、バイパスダイオード異常、植生影響、汚れなどを自動検出します。

## デモ

[Live Demo](https://solar-panel-inspection-system.vercel.app) *(デプロイ時に設定)*

## 主な機能

- 🔍 **大規模対応** - 10万パネルの効率的な管理
- 🌡️ **熱画像解析** - AIによる異常自動検出
- 🗺️ **GPS座標マッピング** - 正確な位置情報管理
- 📊 **リアルタイム可視化** - グリッド/地図ビュー切り替え
- 📱 **モバイル対応** - レスポンシブデザイン
- 📈 **履歴管理** - 過去の解析結果を保存・参照

## クイックスタート

### 前提条件

- Node.js 18.0.0以上
- npm 9.0.0以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/haudi-development/solar-panel-inspection-system.git
cd solar-panel-inspection-system

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 使い方

### メガソーラーモード

1. トップページから「メガソーラー解析を開始」をクリック
2. サイト情報を確認（デモデータ使用）
3. 「解析開始」ボタンをクリック
4. 解析結果をグリッドビューまたは地図ビューで確認
5. ブロックをクリックして詳細を表示

### 異常検出カテゴリ

| カテゴリ | 説明 | 重要度 | 推奨対応 |
|---------|------|--------|----------|
| 🔴 ホットスポット | 過熱箇所（65-85°C） | 重大 | 即時点検・交換 |
| 🟠 バイパスダイオード | 電気系統異常 | 重大 | 電気系統点検 |
| 🟢 植生 | 草木による影響 | 中程度 | 草刈り・剪定 |
| 🟡 汚れ | パネル表面の汚れ | 中程度 | 清掃作業 |

## プロジェクト構造

```
├── app/                    # Next.js App Router
├── components/            # Reactコンポーネント
│   ├── analysis/         # 解析プログレス
│   ├── history/          # 履歴管理
│   ├── map/              # 地図表示
│   ├── report/           # レポート生成
│   └── ui/               # UIコンポーネント
├── lib/                   # ユーティリティ関数
├── types/                 # TypeScript型定義
└── public/                # 静的ファイル
```

## 技術スタック

- [Next.js 14](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [React Leaflet](https://react-leaflet.js.org/) - 地図表示
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント

## 開発

### 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm start        # プロダクションサーバー起動
npm run lint     # ESLint実行
```

### 環境変数

`.env.local`ファイルを作成（必要に応じて）:

```env
# Supabase設定（将来的な実装用）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## ドキュメント

- [開発引き継ぎドキュメント](./DEVELOPMENT_HANDOVER.md) - 詳細な技術情報
- [機能詳細仕様書](./FEATURE_DETAILS.md) - 実装済み機能の詳細
- [プロジェクトサマリー](./docs/PROJECT_SUMMARY.md) - プロジェクト概要

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、[GitHubのIssues](https://github.com/haudi-development/solar-panel-inspection-system/issues)で報告してください。

## 作者

Haudi Development

---

Built with ❤️ using Next.js and TypeScript