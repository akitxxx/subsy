# サブシステムアーキテクチャ設計書

## 1. 3大原則
1. **層分離**：UI ↔ ロジック ↔ データ
2. **自己完結**：1機能=1ディレクトリ
3. **単方向依存**：矢印は左から右のみ

## 2. 絶対ディレクトリ構造
```text
src/
├─ app/          # ページ定義（Next.js）
├─ features/     # 機能モジュール（例: user）
│   ├─ usecase/  # ビジネスロジック
│   ├─ hooks/    # 状態管理
│   └─ types/    # 型定義
├─ lib/          # 技術基盤（DB/API）
└─ components/   # 共通UI部品
```

## 3. 鉄板ルール
### 3.1 命名規則
| 種類          | パターン               | 例                     |
|---------------|------------------------|------------------------|
| ユースケース   | [Action].usecase.ts     | getCurrentUser.usecase.ts  |
| テスト        | [File].spec.ts         | UserCard.spec.tsx      |
| フック        | use[State].ts          | useSession.ts          |

### 3.2 禁止事項
```typescript
// ❌ 横断参照禁止
import { api } from '../../other-feature'

// ✅ 許可される参照
import { doAuth } from '@/features/auth'
import { Button } from '@/components'
```

## 4. 実装
```typescript
// Honoエンドポイント例
app.get('/users/:id', async (c) => {
  const user = await GetCurrentUserUsecase.run({ id: c.req.param('id') })
  return c.json(user)
})
```

```typescript
// usecase実装例
const run = ({ db }:Inject) => async (p: Input): Output => {
  // ...
}
export const GetCurrentUserUsecase { run }
```

```typescript
// clientではhono clientを利用しRPCで型安全に実装する
import { hono } from '@/lib/hono/hono';
const res = await hono.XXX
```

## 5. エラー設計
```typescript
// エラーレスポンスフォーマット
{
  "error": {
    "type": "INVALID_ARGUMENT",      // エラー種別
    "title": "Invalid Parameter(s)", // 人間可読なエラーの概要
    "status": 400,                   // HTTPステータスコード
    "detail": "Request contains invalid parameters.", // エラーの詳細説明
    "details": [                     // バリデーションエラーの詳細リスト
      {
        "field": "name",            // エラーが発生したフィールド
        "reason": "required",       // エラーの理由
        "message": "The 'name' field is required." // エラーメッセージ
      }
    ]
  }
}
```

## 6. テスト基本方針
```text
1. ユースケース：100%カバレッジ
2. コンポーネント：主要機能のみ
3. E2E：主要フロー3個
```

## 7. 開発フロー
```text
[新機能作成]
1. features/[name] 作成
2. usecase/test作成
3. PR提出（カバレッジ証明必須）

[リファクタリング]
1. 既存機能変更禁止
2. 新規useケース追加のみ
```

## 8. 可視化図
```text
[依存関係]
UI → usecase → lib
      △        △
      └─ types ┘
```

**AIが守る唯一のルール**：この設計書にないものは存在しない
