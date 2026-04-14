# INT-000 UNIT-002: 貸出・返却操作（QRコードスキャン）

## Purpose（目的）

備品のQRコードをスキャンした後の貸出・返却操作を実現する。
利用者がブラウザ内でQRコードをスキャンして備品詳細ページへ遷移し、
そのページで貸出申請・返却操作を完結できるようにする。

## Boundaries（境界）

### 対象（In Scope）
- 備品詳細ページ（`/equipment/[id]`）への貸出フォーム追加
  - 借り手名入力（必須）
  - 返却予定日入力（任意、defaultReturnDaysから自動計算）
  - 「借りる」ボタン → loans テーブルにレコード作成
- 備品詳細ページへの返却ボタン追加
  - 「返却する」ボタン → loans.returned_at を現在日時で更新
- QRスキャンページ（`/scan`）の実装
  - BarcodeDetector API を使用したリアルタイムスキャン
  - スキャン成功時に `/equipment/[id]` へ遷移

### 対象外（Out of Scope）
- 返却期限アラート表示（UNIT-003）
- 貸出状況全体一覧（UNIT-003）
- 全履歴ページ（UNIT-003）

## Dependencies（依存関係）

### 前提Unit
- UNIT-001 完了（equipmentテーブル・loansテーブル・備品詳細ページが存在すること）

### 外部依存
- ブラウザ標準 BarcodeDetector API（外部ライブラリ不要）
- Next.js Server Actions / revalidatePath / redirect

### 後続Unitへの提供
- UNIT-003: loans テーブルに貸出・返却データが蓄積される

## 担当ユーザーストーリー
- US-005: QRコードスキャンによる貸出
- US-006: QRコードスキャンによる返却
