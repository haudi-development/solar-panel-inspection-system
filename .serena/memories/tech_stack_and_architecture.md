# 技術スタックとアーキテクチャ

## フロントエンド技術スタック
- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript (strict mode有効)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui (Radix UI based)
- **状態管理**: React hooks (useState)

## バックエンド/インフラ
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **認証**: Supabase Auth (未実装)
- **ホスティング**: Vercel (推奨)

## 主要ライブラリ
- react-dropzone: ファイルアップロード
- lucide-react: アイコン
- recharts: チャート表示
- leaflet/react-leaflet: 地図表示（将来実装用）
- @supabase/ssr: Supabase SSR対応

## プロジェクト構造
```
solar-panel-inspection-system/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx          # メインページ（'use client'）
│   └── globals.css       # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── upload/           # ImageUploader
│   ├── analysis/         # AnalysisProgress
│   ├── report/           # ReportViewer, AnomalyMap, StatisticsSummary
│   └── ui/              # button, card, progress (shadcn/ui)
├── lib/                  # ユーティリティ
│   ├── supabase/        # Supabaseクライアント設定
│   └── utils/           # dummy-data-generator, cn helper
├── types/               # TypeScript型定義
│   ├── index.ts        # ビジネスロジック型
│   └── database.ts     # Supabaseデータベース型
├── docs/               # プロジェクトドキュメント
└── supabase/          # データベーススキーマ
```

## アーキテクチャの特徴
- Client-side rendering (CSR) 主体
- コンポーネントベースの設計
- 型安全性重視（TypeScript strict mode）
- MVP版はダミーデータで動作