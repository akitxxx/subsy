# アーキテクチャ設計ドキュメント

## 目次

1. [全体構造](#全体構造)
2. [ディレクトリ構造](#ディレクトリ構造)
3. [モジュール間の依存関係](#モジュール間の依存関係)
4. [各モジュールの責務](#各モジュールの責務)
5. [データフロー](#データフロー)
6. [状態管理](#状態管理)
7. [エラーハンドリング](#エラーハンドリング)

## 全体構造

このプロジェクトは、Next.jsをベースにしたモノリスアーキテクチャを採用しています。フロントエンド（クライアントサイド）とAPI（サーバーサイド）の責務を明確に分離し、共通のコードを再利用可能な形で管理します。

```
クライアント層 (frontend) → 共通層 (shared) ← サーバー層 (api)
```

## ディレクトリ構造

プロジェクトの主要なディレクトリ構造は以下の通りです：

- src/ - ソースコード全体
  - app/ - Next.js App Router
  - frontend/ - フロントエンド実装
    - features/ - 機能別モジュール
    - shared/ - 共通コンポーネント・ユーティリティ
  - api/ - API実装
    - features/ - 機能別APIモジュール
    - shared/ - 共通APIユーティリティ
  - shared/ - フロントエンド・API間共通コード
    - types/ - 共通型定義
    - domain/ - ドメインモデル
    - enums/ - 列挙型定義
    - utils/ - 共通ユーティリティ関数
    - lib/ - ライブラリ統合
    - test/ - テスト用ユーティリティ

### frontend/features/

各機能モジュールは以下のような構造を持ちます：

- frontend/features/
  - auth/ - 認証・認可関連機能
    - components/ - 認証UI
    - hooks/ - 認証関連フック
    - api.ts - 認証API
    - index.ts - 公開API
  - users/ - ユーザー管理機能
    - components/ - ユーザー関連UI
    - hooks/ - ユーザー関連フック
    - api.ts - ユーザーAPI
    - index.ts - 公開API
  - ... - その他機能モジュール

### frontend/shared/

フロントエンド共通モジュールの構造：

- frontend/shared/
  - components/ - 共通UIコンポーネント
    - ui/ - 基本的なUIコンポーネント
    - forms/ - フォーム関連
    - layout/ - レイアウト系
    - feedback/ - 通知・アラート系
  - hooks/ - 共通カスタムフック
  - utils/ - フロントエンド共通ユーティリティ
  - index.ts - 公開API

### api/features/

API機能モジュールの構造：

- api/features/
  - auth/ - 認証・認可関連API
    - handlers/ - APIハンドラ
    - services/ - ビジネスロジック
    - index.ts - 公開API
  - users/ - ユーザー管理API
    - handlers/ - APIハンドラ
    - services/ - ビジネスロジック
    - index.ts - 公開API
  - ... - その他APIモジュール

### api/shared/

API共通モジュールの構造：

- api/shared/
  - db/ - データベース接続・設定
  - middlewares/ - 共通ミドルウェア
    - auth.ts - 認証ミドルウェア
    - validation.ts - バリデーションミドルウェア
    - ... - その他ミドルウェア
  - errors/ - エラーハンドリング
  - utils/ - ユーティリティ関数

### shared/

共通モジュールの構造：

- shared/
  - types/ - 共通型定義
    - models/ - モデルの型定義
    - api/ - API関連の型定義
    - common/ - 汎用型定義
  - domain/ - ドメインモデル
  - enums/ - 列挙型定義
  - utils/ - 共通ユーティリティ関数
  - lib/ - ライブラリ統合
  - test/ - テスト用ユーティリティ

## モジュール間の依存関係

依存方向の原則:

```
frontend/features → frontend/shared
       ↓
     shared
       ↑
 api/features → api/shared
```

* **許可される依存関係**:
  * `frontend/features` → `frontend/shared`, `shared`
  * `frontend/shared` → `shared`
  * `api/features` → `api/shared`, `shared`
  * `api/shared` → `shared`

* **禁止される依存関係**:
  * `frontend` → `api` (直接依存しない)
  * `api` → `frontend` (直接依存しない)
  * 下位モジュールから上位モジュールへの依存 (`shared` → `frontend` など)

## 各モジュールの責務

### app/

* Next.js App Router のページ定義
* レイアウト設定
* ルーティング構成
* ページレベルのメタデータ

### frontend/features/

* 機能別のUI実装
* ビジネスロジックとUIの結合
* 状態管理
* APIとの通信

各機能モジュールの内部構造:
```
frontend/features/users/
├── components/    # UI コンポーネント
├── hooks/         # 機能固有のカスタムフック
├── api.ts         # APIクライアント関数
├── types.ts       # 機能固有の型定義
├── utils.ts       # ユーティリティ関数
└── index.ts       # 公開API
```

### frontend/shared/

* 再利用可能なUIコンポーネント
* フロントエンド共通ユーティリティ
* カスタムフック
* HOC（高階コンポーネント）

### api/features/

* 機能別APIエンドポイント
* サーバーサイドのビジネスロジック
* データベース操作
* 外部APIとの通信

### api/shared/

* API共通ユーティリティ
* データベース接続
* 認証・認可ヘルパー
* ミドルウェア
* エラーハンドリング

### shared/

* フロントエンドとAPI間で共有される型定義、定数、列挙型
* ドメインモデル
* 共通ユーティリティ関数
* テスト用ユーティリティ
* ライブラリ統合

## データフロー

1. **クライアントからサーバーへ**:
   * フロントエンドでは、状態管理ライブラリを使用してAPIリクエストを管理
   * API通信用の関数は機能モジュール内に配置

2. **サーバーからデータベースへ**:
   * Drizzle ORMを使用してデータアクセス
   * Supabaseも利用したデータ管理

3. **レスポンス**:
   * 共通のレスポンス形式を定義
   * エラーコードとメッセージの標準化

## 状態管理

1. **サーバー状態**:
   * TanStack Queryを使用したサーバー状態管理
   * キャッシュ、再取得、楽観的更新の戦略

2. **クライアント状態**:
   * グローバル状態と局所的な状態の分離
   * React Context APIを活用した状態管理
   
3. **フォーム状態**:
   * React Hook Formを使用した入力値の状態管理
   * Zodを用いたバリデーション

## エラーハンドリング

1. **API エラー**:
   * 標準化されたエラーレスポンス形式
   * エラーコードの一元管理
   * エラーレスポンスの処理方針

2. **フロントエンドでのエラー表示**:
   * ユーザーへのエラー通知戦略
   * フォームエラーの表示方法
   * システムエラーの処理方針 