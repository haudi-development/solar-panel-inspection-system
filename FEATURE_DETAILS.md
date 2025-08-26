# 実装済み機能の詳細仕様書

## 1. メガソーラーサイト解析機能

### データ構造と階層

```typescript
サイト（Site）
├── 基本情報
│   ├── サイト名
│   ├── GPS座標（中心点）
│   ├── 総発電容量（MW）
│   └── 総パネル数（100,000枚）
│
└── ブロック（1,000個）
    ├── ブロックID
    ├── ブロック番号（A0-1形式）
    ├── GPS座標
    ├── パネル数（100枚/ブロック）
    ├── 配置（10×10グリッド）
    ├── RGB画像URL
    ├── 熱画像URL
    └── 検出された異常リスト
```

### サイトレイアウト仕様

実際のメガソーラーファームを模した不規則な7エリア構成：

```javascript
エリア1: 行0-15, 列3-18   （密度95%）
エリア2: 行0-12, 列19-28  （密度90%）
エリア3: 行16-35, 列0-15  （密度93%）
エリア4: 行16-40, 列16-30 （密度97%）
エリア5: 行36-48, 列2-12  （密度88%）
エリア6: 行41-50, 列13-22 （密度85%）
エリア7: 行45-50, 列23-28 （密度75%）
```

## 2. 異常検出アルゴリズム

### 検出カテゴリと特徴

#### ホットスポット（Hotspot）
- **検出温度**: 65-85°C
- **表示色**: 赤（#ef4444）
- **重要度**: critical
- **特徴**: 単一/複数セルの過熱
- **推奨対応**: 即時点検・交換

#### バイパスダイオード異常（Bypass Diode）
- **検出温度**: 55-70°C
- **表示色**: オレンジ（#f97316）
- **重要度**: critical
- **特徴**: ストリング全体の異常
- **推奨対応**: 電気系統点検

#### 植生影響（Vegetation）
- **検出温度**: 40-50°C
- **表示色**: 緑（#10b981）
- **重要度**: moderate
- **特徴**: 部分的な影
- **推奨対応**: 草刈り・剪定

#### 汚れ（Soiling）
- **検出温度**: 45-55°C
- **表示色**: 黄（#eab308）
- **重要度**: moderate
- **特徴**: 均一な温度上昇
- **推奨対応**: 清掃作業

### 異常生成ロジック

```typescript
// 異常ブロック数: 20-30個（全体の約0.1%）
const anomalyBlockCount = Math.floor(20 + Math.random() * 10)

// カテゴリ分布
- ホットスポット: 30%
- バイパスダイオード: 25%
- 植生: 25%
- 汚れ: 20%

// 各ブロック内の異常数: 1-5個
```

## 3. ビューコンポーネント仕様

### グリッドビュー（MegaSolarMap.tsx）

#### 表示仕様
- **キャンバスサイズ**: 1400×1000px（デスクトップ）、画面幅×500px（モバイル）
- **セルサイズ**: 自動計算（全体が表示されるよう調整）
- **初期ズーム**: 全ブロックが画面内に収まる倍率
- **操作**: マウスドラッグ（パン）、ホイール（ズーム）、タッチ対応

#### ブロック詳細表示
- **クリック時**: モーダル表示
- **内容**:
  - RGB画像（左側）
  - 熱画像（右側）
  - 検出ボックス（AI風の矩形表示）
  - 異常リスト

### 地図ビュー（SolarSiteMap.tsx）

#### 地図仕様
- **ライブラリ**: React Leaflet
- **タイル**: OpenStreetMap / 衛星画像
- **初期ズーム**: レベル16
- **ブロック表示**: Rectangle（矩形）オーバーレイ

#### GPS座標計算
```typescript
// ブロックサイズ: 約10m×6m
latitude ± 0.000045
longitude ± 0.000027
```

## 4. 履歴管理システム

### データ保存仕様
- **ストレージ**: LocalStorage
- **キー**: 'mega-solar-history'
- **形式**: JSON配列
- **保存項目**:
  - サイト情報
  - 解析レポート
  - タイムスタンプ
  - 全異常データ

### 復元処理
```typescript
// Map型の復元処理
const restoredItems = items.map(item => ({
  ...item,
  report: {
    ...item.report,
    blockResults: item.report.blockResults.map(result => ({
      ...result,
      anomalies: result.anomalies || []
    }))
  }
}))
```

## 5. レスポンシブデザイン仕様

### ブレークポイント
- **モバイル**: < 640px
- **タブレット**: 640px - 1024px
- **デスクトップ**: > 1024px

### モバイル最適化
- タッチイベント対応
- ピンチズーム実装
- 簡略化されたUI
- 縦向き最適化

### 具体的な対応内容
```css
/* ヘッダー */
- デスクトップ: フルテキスト表示
- モバイル: アイコンのみ or 省略表示

/* グリッド */
- デスクトップ: 5カラム
- タブレット: 3カラム
- モバイル: 2カラム

/* 地図 */
- デスクトップ: 500px高さ
- モバイル: 350px高さ
```

## 6. パフォーマンス最適化

### 大規模データ処理
- **仮想スクロール**: 未実装（将来的に必要）
- **遅延読み込み**: ブロック詳細は必要時のみ
- **メモリ管理**: 不要なデータの早期解放

### レンダリング最適化
- **Canvas API**: グリッドビュー描画
- **React.memo**: 未使用（将来的に検討）
- **動的インポート**: Leaflet関連コンポーネント

## 7. サンプル画像仕様

### ディレクトリ構造
```
public/mega-solar/samples/
├── sample-rgb-normal.png         # 正常時RGB
├── sample-rgb-hotspot.png        # ホットスポットRGB
├── sample-rgb-bypass-diode.png   # バイパスダイオードRGB
├── sample-rgb-vegetation.png     # 植生RGB
├── sample-rgb-soiling.png        # 汚れRGB
├── sample-thermal-normal.png     # 正常時熱画像
├── sample-thermal-hotspot.png    # ホットスポット熱画像
├── sample-thermal-bypass-diode.png # バイパスダイオード熱画像
├── sample-thermal-vegetation.png # 植生熱画像
└── sample-thermal-soiling.png    # 汚れ熱画像
```

### 画像選択ロジック
```typescript
// 異常がある場合: 最も重要度の高い異常の画像を表示
// 異常がない場合: normal画像を表示
const primaryAnomaly = anomalies.find(a => a.severity === 'critical') 
                    || anomalies[0]
```

## 8. 統計計算仕様

### 集計ロジック
```typescript
// 正常ブロック数
normalBlocks = analyzedBlocks - blocksWithAnomalies

// カテゴリ別集計
hotspotCount = anomalies.filter(a => a.category === 'hotspot').length
bypassDiodeCount = anomalies.filter(a => a.category === 'bypass_diode').length
vegetationCount = anomalies.filter(a => a.category === 'vegetation').length
soilingCount = anomalies.filter(a => a.category === 'soiling').length

// 重要度別集計
criticalCount = anomalies.filter(a => a.severity === 'critical').length
moderateCount = anomalies.filter(a => a.severity === 'moderate').length
```

### 推奨アクション生成
```typescript
優先度順:
1. critical異常が10件以上 → "緊急点検が必要"
2. ホットスポット5件以上 → "パネル交換検討"
3. バイパスダイオード3件以上 → "電気系統点検"
4. 植生10件以上 → "草刈り作業"
5. 汚れ15件以上 → "清掃作業計画"
```

## 9. エラーハンドリング

### LocalStorage エラー
```typescript
try {
  localStorage.setItem(key, value)
} catch (e) {
  console.error('Storage full or unavailable')
  // 古いデータを削除して再試行
}
```

### 画像読み込みエラー
- フォールバック画像表示
- エラーメッセージ表示
- 再読み込みボタン提供

## 10. 将来の拡張ポイント

### API統合準備
```typescript
// 既に型定義済み
interface AnalysisRequest {
  siteId: string
  images: File[]
  analysisType: 'thermal' | 'rgb' | 'both'
}
```

### リアルタイム更新準備
- WebSocket接続ポイント設計済み
- 状態管理の拡張余地あり
- プログレッシブ更新対応可能

### 国際化準備
- テキストの外部化可能
- 日付フォーマット対応済み
- 数値フォーマット対応済み