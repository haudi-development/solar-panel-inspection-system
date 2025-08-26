# メガソーラー画像ディレクトリ構造

## ディレクトリ説明

### /rgb/
実際のRGB画像を格納
- 命名規則: `block-{row}-{col}.png`
- 例: `block-0-0.png`, `block-10-5.png`

### /thermal/
サーマル画像を格納
- 命名規則: `block-{row}-{col}.png`
- 例: `block-0-0.png`, `block-10-5.png`

### /samples/
異常タイプごとのサンプル画像を格納

#### RGB サンプル画像
- `sample-rgb-hotspot.png` - ホットスポットのRGB画像サンプル
- `sample-rgb-bypass-diode.png` - バイパスダイオード異常のRGB画像サンプル
- `sample-rgb-vegetation.png` - 植生影響のRGB画像サンプル
- `sample-rgb-soiling.png` - 汚れのRGB画像サンプル
- `sample-rgb-normal.png` - 正常パネルのRGB画像サンプル

#### サーマル サンプル画像
- `sample-thermal-hotspot.png` - ホットスポットのサーマル画像サンプル
- `sample-thermal-bypass-diode.png` - バイパスダイオード異常のサーマル画像サンプル
- `sample-thermal-vegetation.png` - 植生影響のサーマル画像サンプル
- `sample-thermal-soiling.png` - 汚れのサーマル画像サンプル
- `sample-thermal-normal.png` - 正常パネルのサーマル画像サンプル

## 画像仕様
- 推奨サイズ: 800x600px
- フォーマット: PNG
- サーマル画像: カラーマップ適用済み（青→緑→黄→赤の温度勾配）