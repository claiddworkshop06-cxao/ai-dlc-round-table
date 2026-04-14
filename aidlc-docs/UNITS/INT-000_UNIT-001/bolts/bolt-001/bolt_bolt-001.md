# Bolt: bolt-001

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-001
- Target User Stories: US-001, US-002, US-003, US-004
- Goal (Definition of Done):
  - DBスキーマ（`equipment` / `loans`テーブル）が定義・マイグレーション済みである
  - 備品マスタのCRUD（一覧・登録・編集・削除）が動作する
  - 備品詳細ページにQRコードが表示される
  - スマートフォンブラウザで基本操作が問題なく行える

## 1. Scope

### In Scope
- DBスキーマ定義（`src/schema.ts` への追加）
  - `equipment`テーブル: id, name, description, default_return_days, created_at
  - `loans`テーブル: id, equipment_id, borrower_name, borrowed_at, return_due_at, returned_at
- Drizzleマイグレーションの実行
- Server Actionsの実装（`app/actions/equipment.ts`）
  - `getEquipments()`: 備品一覧取得
  - `getEquipment(id)`: 備品詳細取得
  - `createEquipment(data)`: 備品作成
  - `updateEquipment(id, data)`: 備品更新
  - `deleteEquipment(id)`: 備品削除
- ページの実装
  - `/equipment` : 備品一覧ページ
  - `/equipment/new` : 備品登録フォームページ
  - `/equipment/[id]` : 備品詳細ページ（QRコード表示含む）
  - `/equipment/[id]/edit` : 備品編集フォームページ
- QRコード表示（`qrcode.react` ライブラリを使用）
- shadcn/ui コンポーネントを活用したUI実装
- 既存の `/`（コメントページ）へのナビゲーションリンクは維持

### Out of Scope
- QRコードスキャン機能（UNIT-002 / Bolt-002以降）
- 貸出・返却ボタン（UNIT-002）
- 返却期限アラート表示（UNIT-003）
- 認証・認可

## 2. Dependencies & Prerequisites

- Dependencies (other Units/external/data):
  - 既存DBコネクション: `src/db.ts`（流用）
  - 既存スキーマ: `src/schema.ts`（`comments`テーブルへの追記）
  - `qrcode.react` パッケージ（新規インストール要）
- Prerequisites (environment/permissions/tools):
  - Neon DBへの接続設定済み（`DATABASE_URL` / `NETLIFY_DATABASE_URL`）
  - `npm install` 実行可能な環境
- Constraints (for Brownfield):
  - 既存の`comments`テーブルと`commentsページ`は破壊しない
  - 既存の`src/schema.ts`・`src/db.ts`を拡張して使用する

## 3. Design Diff

- Which design to update: DBスキーマ（Domain Design相当）
- Changes to I/O/API/data model:

### equipmentテーブル
| カラム名 | 型 | 説明 |
|---|---|---|
| id | serial PK | 備品ID |
| name | text NOT NULL | 備品名 |
| description | text | 説明 |
| default_return_days | integer | デフォルト返却期限日数 |
| created_at | timestamp with timezone | 登録日時 |

### loansテーブル
| カラム名 | 型 | 説明 |
|---|---|---|
| id | serial PK | 貸出記録ID |
| equipment_id | integer FK(equipment.id) | 備品ID |
| borrower_name | text NOT NULL | 借り手名 |
| borrowed_at | timestamp with timezone | 貸出開始日時 |
| return_due_at | timestamp with timezone | 返却予定日時 |
| returned_at | timestamp with timezone | 返却完了日時（nullなら貸出中） |

- Error/retry/idempotency handling: バリデーションエラーはフォーム上にメッセージ表示
- Observation points: なし（PoC）

## 4. Implementation & Tests

- Target paths:
  - `src/schema.ts` （equipment・loansテーブル追加）
  - `src/db.ts` （既存流用）
  - `app/actions/equipment.ts` （Server Actions）
  - `app/equipment/page.tsx` （備品一覧）
  - `app/equipment/new/page.tsx` （備品登録）
  - `app/equipment/[id]/page.tsx` （備品詳細・QRコード）
  - `app/equipment/[id]/edit/page.tsx` （備品編集）
  - `components/equipment/EquipmentForm.tsx` （登録・編集共通フォーム）
  - `components/equipment/QRCodeDisplay.tsx` （QRコード表示）
- Unit test viewpoints: PoCのため省略

## 5. Deployment Units

- Affected deployment units: Netlify（既存デプロイ環境）
- Deployment procedures/notes:
  1. `npm install qrcode.react`（または`react-qr-code`）を実行
  2. `npx drizzle-kit push` でDBスキーマを適用
  3. ローカルで動作確認後、`git push` してNetlifyへ自動デプロイ
- Rollback: マイグレーション失敗時は `equipment` / `loans` テーブルを手動DROP

## 6. Approval Gate
- [x] Scope is agreed upon
- [x] Design diff is appropriate
- [x] Test viewpoints are appropriate
- [x] Deployment/rollback is appropriate

Approver: AI-DLC Orchestrator
Approval Date: 2026-04-15

## Outcome
- What was completed: （実装後に記入）
- What could not be completed: （実装後に記入）
- Changed design/assumptions: （実装後に記入）

## Open Issues
- Unresolved items: QRコードライブラリの選定（`qrcode.react` vs `react-qr-code`）→ `react-qr-code` を優先（RSC対応しやすい）
- Blockers: なし
- Pending decisions: なし

## Next Bolt
- What to do next: UNIT-001 bolt-002（またはUNIT-002 bolt-001） — QRコードスキャン機能の実装
- Required input for next: bolt-001の備品詳細ページURL形式（`/equipment/[id]`）
- Risks: QRコードスキャンはブラウザのカメラAPI（`getUserMedia`）を使用するため、HTTPSが必要
