# Bolt: UNIT-003 bolt-001

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-003
- Target User Stories: US-007, US-008
- Goal (Definition of Done):
  - `/status` ページで全備品の貸出状況・アラートが表示される
  - `/history` ページで全貸出履歴が日付降順で表示される
  - 備品一覧（`/equipment`）にアラートカラーが反映される

## 1. Scope

### In Scope
- `app/status/page.tsx`（新規）
  - 貸出中アイテム: 借り手・日付・アラートレベル表示
  - アラートロジック: returnDueAt < now → overdue（赤）/ < now+1日 → warning（黄）
  - サマリーバッジ（利用可能・貸出中・超過・間近の件数）
- `app/history/page.tsx`（新規）
  - loans ×× equipment の INNER JOIN で全履歴取得
  - 貸出中レコードをオレンジ背景でハイライト
- `app/equipment/page.tsx`（更新）
  - アラートレベルに応じたバッジカラー（赤・黄・オレンジ）
- `app/layout.tsx`（更新）
  - ナビリンクに「貸出状況」「履歴」を追加

### Out of Scope
- 通知機能
- ページネーション・フィルタ

## 2. Dependencies & Prerequisites
- UNIT-001・UNIT-002 完了済み

## 3. Design Diff
- 追加ライブラリなし
- Drizzle マイグレーション不要（スキーマ変更なし）
- アラートロジックはサーバーサイドで計算（純粋なDate比較）

## 4. Implementation & Tests
- Target paths:
  - `app/status/page.tsx`（新規）
  - `app/history/page.tsx`（新規）
  - `app/equipment/page.tsx`（更新）
  - `app/layout.tsx`（更新）
- Unit test viewpoints: PoCのため省略

## 5. Deployment Units
- 追加ライブラリなし・マイグレーション不要
- git push → Netlify 自動デプロイ

## 6. Approval Gate
- [x] Scope is agreed upon
- [x] Design diff is appropriate
- [x] Deployment/rollback is appropriate

Approver: AI-DLC Orchestrator
Approval Date: 2026-04-15

## Outcome
- What was completed: 貸出状況一覧・全履歴・アラートカラーの実装
- What could not be completed: —

## Next Bolt
- 全3Unit完了。PoCとして全機能（US-001〜008）が実装された。
