# Bolt: UNIT-002 bolt-001

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-002
- Target User Stories: US-005, US-006
- Goal (Definition of Done):
  - 備品詳細ページで「借りる」フォームが表示・送信できる（利用可能時）
  - 備品詳細ページで「返却する」ボタンが表示・送信できる（貸出中時）
  - `/scan` ページでカメラによるQRコードスキャンが動作する
  - スキャン後に対象備品の詳細ページへ遷移する

## 1. Scope

### In Scope
- `app/equipment/[id]/page.tsx` の更新
  - `lendEquipment` Server Action: loans テーブルにレコード INSERT
  - `returnEquipment` Server Action: loans.returned_at を UPDATE
  - 貸出フォームUI（借り手名・返却予定日）
  - 返却ボタンUI（貸出中情報表示 + ボタン）
- `components/equipment/ScannerView.tsx`（Client Component）
  - BarcodeDetector API でリアルタイムQRスキャン
  - スキャン結果のURL解析 → `/equipment/[id]` へルーティング
- `app/scan/page.tsx`（スキャンページ）
- `app/layout.tsx` にスキャンページへのナビリンク追加

### Out of Scope
- 貸出状況アラート（UNIT-003）
- 全履歴ページ（UNIT-003）

## 2. Dependencies & Prerequisites
- UNIT-001 の loans / equipment テーブルが存在すること
- HTTPS 環境（カメラ API に必要）または localhost

## 3. Design Diff

### loans テーブル操作
- INSERT: equipmentId, borrowerName, returnDueAt（貸出時）
- UPDATE: returnedAt = NOW()（返却時）

## 4. Implementation & Tests
- Target paths:
  - `app/equipment/[id]/page.tsx`（更新）
  - `components/equipment/ScannerView.tsx`（新規）
  - `app/scan/page.tsx`（新規）
  - `app/layout.tsx`（ナビ追加）
- Unit test viewpoints: PoCのため省略

## 5. Deployment Units
- 追加ライブラリなし（BarcodeDetector はブラウザ標準API）
- Drizzle マイグレーション不要（スキーマ変更なし）

## 6. Approval Gate
- [x] Scope is agreed upon
- [x] Design diff is appropriate
- [x] Deployment/rollback is appropriate

Approver: AI-DLC Orchestrator
Approval Date: 2026-04-15

## Outcome
- What was completed: 貸出・返却UI + QRスキャンページの実装
- What could not be completed: —
- Changed design/assumptions: QRスキャンに外部ライブラリを使わず BarcodeDetector API を採用

## Next Bolt
- What to do next: UNIT-003 — 貸出状況一覧・履歴・返却期限アラート
