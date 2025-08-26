# API仕様書

## 概要
本システムのAPIは、Supabase JavaScript SDKを通じてアクセスされます。
以下は主要なデータモデルとAPIエンドポイントの仕様です。

## データベーススキーマ

### projects テーブル
プロジェクト（太陽光発電所）の情報を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | プライマリキー |
| name | text | プロジェクト名 |
| location | text | 設置場所 |
| capacity_mw | decimal | 発電容量（MW） |
| panel_rows | integer | パネル行数（デフォルト: 4） |
| panel_cols | integer | パネル列数（デフォルト: 12） |
| created_at | timestamp | 作成日時 |
| user_id | text | ユーザーID |

### inspections テーブル
点検情報を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | プライマリキー |
| project_id | uuid | プロジェクトID（外部キー） |
| inspection_date | date | 点検日 |
| status | text | ステータス（uploading/analyzing/completed） |
| total_panels | integer | 総パネル数（デフォルト: 48） |
| created_at | timestamp | 作成日時 |

### images テーブル
アップロードされた画像を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | プライマリキー |
| inspection_id | uuid | 点検ID（外部キー） |
| file_url | text | 画像URL |
| thermal_url | text | サーマル画像URL |
| image_type | text | 画像タイプ（rgb/thermal） |
| grid_position | integer | グリッド位置 |
| created_at | timestamp | 作成日時 |

### anomalies テーブル
検出された異常を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | プライマリキー |
| inspection_id | uuid | 点検ID（外部キー） |
| panel_id | text | パネルID（例: A01） |
| anomaly_type | text | 異常タイプ |
| severity | text | 重要度（critical/moderate/minor） |
| iec_class | text | IECクラス（IEC1/IEC2/IEC3/unclassified） |
| power_loss_watts | decimal | 電力損失（W） |
| temperature_delta | decimal | 温度差（°C） |
| coordinates | jsonb | 座標情報 |
| created_at | timestamp | 作成日時 |

## 異常タイプ

| タイプ | 説明 |
|--------|------|
| hotspot_single | 単一ホットスポット |
| hotspot_multi | 複数ホットスポット |
| bypass_diode | バイパスダイオード故障 |
| soiling | 汚れ |
| vegetation | 植生による影 |

## API使用例

### プロジェクト作成
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    name: 'オリックス太陽光発電所 #1',
    location: '千葉県市原市',
    capacity_mw: 2.5
  })
  .select()
```

### 点検開始
```typescript
const { data, error } = await supabase
  .from('inspections')
  .insert({
    project_id: projectId,
    status: 'uploading'
  })
  .select()
```

### 画像アップロード
```typescript
// Storage APIを使用
const { data, error } = await supabase.storage
  .from('inspection-images')
  .upload(filePath, file)

// DBに記録
const { data: imageData, error: dbError } = await supabase
  .from('images')
  .insert({
    inspection_id: inspectionId,
    file_url: data.path,
    image_type: 'rgb'
  })
```

### 異常登録
```typescript
const { data, error } = await supabase
  .from('anomalies')
  .insert({
    inspection_id: inspectionId,
    panel_id: 'A01',
    anomaly_type: 'hotspot_single',
    severity: 'critical',
    iec_class: 'IEC2',
    power_loss_watts: 150,
    temperature_delta: 25,
    coordinates: { row: 1, col: 1 }
  })
```

### レポート取得
```typescript
// 点検情報と異常を取得
const { data: inspection, error } = await supabase
  .from('inspections')
  .select(`
    *,
    project:projects(*),
    anomalies(*)
  `)
  .eq('id', inspectionId)
  .single()
```

## エラーハンドリング
すべてのAPI呼び出しは以下のパターンでエラーハンドリングを行います：

```typescript
const { data, error } = await supabase.from('table').select()

if (error) {
  console.error('Error:', error.message)
  // エラー処理
} else {
  // 成功処理
}
```

## レート制限
Supabase無料プランの制限：
- Storage: 1GB
- 帯域幅: 2GB/月
- APIリクエスト: 無制限（ただし同時接続数に制限あり）

## セキュリティ
- Row Level Security (RLS) を有効化
- 匿名ユーザーでもアクセス可能（MVP版）
- 本番環境では認証を実装予定