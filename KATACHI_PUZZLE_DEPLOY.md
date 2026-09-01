# かたちパズル 導入パッケージ

検証日: 2026-09-01

このZIPは、公開中の `flatnijiirosapporo-hash/adia-games` に上書き追加する **差分パッケージ** です。既存リポジトリを丸ごと置き換えるZIPではありません。

## 導入方法

1. 現在の `adia-games` リポジトリをバックアップする。
2. このZIPを展開する。
3. 展開したファイルを、既存リポジトリの同じパスへ上書き・追加する。
4. GitHubへコミット・pushする。
5. GitHub Pages反映後、TOPで「かたちパズル」を検索して起動する。

## 既存ファイルの変更

- `index.html`
- `assets/game_catalog.js`
- `assets/game_profile_v24.js`
- `assets/home_v24.js`
- `assets/layout_v25.js`

## 新規ファイル

- `shape_puzzle.html`
- `assets/shape_puzzle.css`
- `assets/shape_puzzle_core.js`
- `assets/shape_puzzle_app.js`
- `assets/shape_puzzle_data/puzzles_easy.js`
- `assets/shape_puzzle_data/puzzles_normal.js`
- `assets/shape_puzzle_data/puzzles_challenge.js`

## 仕様

- かんたん / ふつう / チャレンジ 各100問、合計300問
- 1回5問
- 5問は難易度帯を1段階ずつ上げて選択
- タイマーは内部計測のみ。子ども画面には表示しない
- ドラッグ、タップ回転、回転ボタン対応
- 枠外・重なりは配置不可
- 3段階ヒント + 45秒無操作時はヒント提案のみ
- 完成時のみ「できた！」演出
- 名前・結果は localStorage / sessionStorage に保存しない
- 支援者が4項目の参考評価を ◎ / ○ / △ で修正可能
- A4縦1枚の印刷/PDF保存用CSS

## 注意

実行環境のChrome組織ポリシーにより、2026-09-01時点で `localhost` と `file://` のブラウザ実画面確認がブロックされました。そのため、iPad実機のタッチ操作とChrome印刷プレビューは未確認です。自動テスト、JavaScript構文検査、300問の解答完全被覆検証は実施済みです。
