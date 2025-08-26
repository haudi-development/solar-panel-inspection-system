# 太陽光パネル点検システム - MVP版

## 概要
ドローン撮影画像から太陽光パネルの異常を検出し、レポートを生成するWebアプリケーションです。
MVP版では、ダミーデータによる解析デモンストレーションを提供します。

## 技術スタック
- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **データベース**: Supabase (PostgreSQL)
- **ホスティング**: Vercel（推奨）

## 主要機能

### 1. 画像アップロード
- 最大10枚までのドローン画像をアップロード可能
- JPEG/PNG形式対応
- ドラッグ&ドロップ対応のインターフェース

### 2. 疑似解析処理
- リアルタイムな進捗表示
- 8段階の解析プロセスシミュレーション
- 完了まで約8秒

### 3. レポート表示
- パネルマップ（4行×12列）
- 異常統計サマリー
- 異常詳細リスト
- IEC規格に基づく分類

### 4. 異常タイプ
- 単一ホットスポット
- 複数ホットスポット
- バイパスダイオード故障
- 汚れ
- 植生による影

## セットアップ手順

### 1. 環境変数の設定
`.env.local`ファイルを作成し、以下を設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Supabaseのセットアップ
1. Supabaseプロジェクトを作成
2. `/supabase/schema.sql`のSQLを実行してテーブルを作成
3. Storage > New Bucket で `inspection-images` バケットを作成

### 3. 依存関係のインストール
```bash
npm install
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## ディレクトリ構造
```
solar-panel-inspection-system/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # レイアウト
│   ├── page.tsx          # メインページ
│   └── globals.css       # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── upload/           # アップロード関連
│   ├── analysis/         # 解析プロセス関連
│   ├── report/           # レポート表示関連
│   └── ui/              # 基本UIコンポーネント
├── lib/                  # ユーティリティ
│   ├── supabase/        # Supabase設定
│   └── utils/           # ヘルパー関数
├── types/               # TypeScript型定義
└── docs/               # ドキュメント
```

## デプロイ

### Vercelへのデプロイ
1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

## 今後の拡張計画

### フェーズ1（2-3ヶ月）
- 実際のオルソ画像生成（OpenDroneMap統合）
- 本格的なAI解析モデル実装
- IEC 62446-3準拠のレポート生成

### フェーズ2（2-3ヶ月）
- 大規模画像処理（数千枚対応）
- 複数拠点管理機能
- 時系列分析・劣化トレンド

### フェーズ3（1-2ヶ月）
- 既存システムとのAPI連携
- モバイル対応
- 機械学習による予測分析

## サポート
問題が発生した場合は、GitHubのIssuesで報告してください。