# 開発コマンド一覧

## 基本開発コマンド
```bash
# 開発サーバー起動（ホットリロード対応）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLintによるコード検査
npm run lint

# 依存関係インストール
npm install

# 依存関係の更新確認
npm outdated
```

## Git操作（macOS/Darwin）
```bash
# ステータス確認
git status

# 変更を追加
git add .

# コミット
git commit -m "メッセージ"

# リモートにプッシュ
git push origin main
```

## ファイル操作（macOS/Darwin）
```bash
# ディレクトリ移動
cd [path]

# ファイル一覧
ls -la

# ファイル検索
find . -name "*.tsx"

# テキスト検索（macOS版）
grep -r "検索文字列" .

# ファイル内容表示
cat [file]
```

## プロセス管理
```bash
# ポート使用状況確認（3000/3001）
lsof -i :3000

# プロセス強制終了
kill -9 [PID]

# Next.jsのキャッシュクリア
rm -rf .next
```

## Supabase関連
```bash
# Supabase CLI（インストール必要）
supabase init
supabase start
supabase db push
```

## トラブルシューティング
```bash
# node_modulesの再インストール
rm -rf node_modules package-lock.json
npm install

# Next.jsキャッシュクリア
rm -rf .next

# TypeScriptの型チェック
npx tsc --noEmit

# 特定ポートのプロセスを確認
lsof -i :3001
```

## デプロイ関連（Vercel）
```bash
# Vercel CLI（要インストール）
vercel
vercel --prod

# 環境変数設定
vercel env add
```

## 注意事項
- 開発サーバーはポート3000（使用中の場合3001）で起動
- macOS環境のため、一部コマンドはLinuxと異なる
- Supabase環境変数の設定が必要（.env.local）