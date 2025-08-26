# コードスタイルと規約

## TypeScript規約
- **strict mode**: 有効（tsconfig.json）
- **型定義**: すべてのPropsとAPIレスポンスに型定義必須
- **インターフェース命名**: `ComponentNameProps`形式
- **型のエクスポート**: types/index.tsに集約

## React/Next.jsコンポーネント規約
- **ファイル名**: PascalCase（例: ImageUploader.tsx）
- **コンポーネント定義**: 関数コンポーネント（export function ComponentName）
- **Client Components**: 'use client'ディレクティブを使用
- **Props**: 分割代入で受け取る
- **フック**: カスタムフックは`use`プレフィックス

## スタイリング規約
- **Tailwind CSS**: インラインクラスで記述
- **クラス結合**: cn()ヘルパー関数を使用（lib/utils.ts）
- **色**: Tailwind標準カラーパレット使用
- **レスポンシブ**: モバイルファースト（sm, md, lg プレフィックス）

## ファイル構成規約
```typescript
// 1. imports
import React from 'react'
import { 外部ライブラリ } from 'package'
import { 内部コンポーネント } from '@/components'
import { 型定義 } from '@/types'

// 2. interface定義
interface ComponentProps {
  // props定義
}

// 3. コンポーネント本体
export function Component({ props }: ComponentProps) {
  // hooks
  // handlers
  // render
}
```

## 命名規約
- **変数/関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型/インターフェース**: PascalCase
- **ファイル**: コンポーネントはPascalCase、その他はkebab-case
- **イベントハンドラ**: handle + 動作（例: handleUpload）

## 日本語対応
- UIテキスト: 日本語使用
- コメント: 日本語可（ただしコード内は最小限）
- ドキュメント: 日本語で記述

## 品質管理
- ESLint設定あり（next lint）
- Prettierなし（手動フォーマット）
- TypeScript strict mode
- エラーハンドリング: try-catchとユーザーフレンドリーなメッセージ