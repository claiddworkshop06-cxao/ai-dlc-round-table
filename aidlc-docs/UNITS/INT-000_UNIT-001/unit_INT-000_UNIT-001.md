# INT-000 UNIT-001: 備品マスタ管理 + DBスキーマ基盤

## Purpose（目的）

備品貸出管理アプリの土台となるDBスキーマを構築し、備品マスタのCRUD機能とQRコード表示機能を実装する。
このUnitが完了することで、UNIT-002（貸出・返却操作）およびUNIT-003（状況確認・履歴）の実装が可能になる。

## Boundaries（境界）

### 対象（In Scope）
- DBスキーマの設計・Drizzleマイグレーション
  - `equipment`テーブル（備品マスタ）
  - `loans`テーブル（貸出記録）
- 備品マスタCRUD
  - 備品の新規登録フォーム
  - 備品の編集フォーム
  - 備品の削除
  - 備品一覧ページ（ステータス表示は基本的なもの）
- 備品詳細ページ
  - QRコード表示（備品詳細ページURLを埋め込む）
- Server Actions によるDB操作

### 対象外（Out of Scope）
- QRコードスキャン機能（UNIT-002）
- 貸出・返却操作のUI（UNIT-002）
- 返却期限アラートの詳細表示（UNIT-003）
- 全履歴一覧ページ（UNIT-003）

## Dependencies（依存関係）

### 前提Unit
- なし（最初のUnit）

### 外部依存
- Drizzle ORM + PostgreSQL (Neon): 既存の接続設定を流用
- `qrcode` または `qrcode.react` ライブラリ: QRコード生成
- shadcn/ui コンポーネント群: 既存インストール済みを活用

### 後続Unitへの提供
- UNIT-002: `equipment`テーブル・`loans`テーブルのスキーマ定義
- UNIT-002: 備品詳細ページ（`/equipment/[id]`）のルーティング
- UNIT-003: 同上のスキーマ・ページ基盤

## 担当ユーザーストーリー
- US-001: 備品の新規登録
- US-002: 備品の編集・削除
- US-003: 備品一覧の確認
- US-004: QRコードの発行・表示
