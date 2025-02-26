# コーディング規約

## 目次

1. [ファイル構成](#ファイル構成)
2. [命名規則](#命名規則)
3. [コンポーネント設計](#コンポーネント設計)
4. [状態管理](#状態管理)
5. [型定義](#型定義)
6. [コメント](#コメント)
7. [テスト](#テスト)
8. [スタイリング](#スタイリング)

## ファイル構成

### ディレクトリ構造

機能モジュールの内部構造は以下のパターンに従います：

```
src/frontend/features/users/
├── components/        # UI コンポーネント
├── hooks/             # カスタムフック
├── api.ts             # API通信関数
├── types.ts           # 機能固有の型定義
├── utils.ts           # ユーティリティ関数
└── index.ts           # Public API
```

### エクスポート規則

* 各機能モジュールは `index.ts` で公開APIを明示的にエクスポート
* 内部実装の詳細は直接インポートしない

```ts
// Good: src/frontend/features/users/index.ts
export { UsersList } from './components/UsersList';
export { useUsers } from './hooks/useUsers';
export type { UserSortOption } from './types';

// Bad: 他のモジュールから直接内部コンポーネントをインポート
// import { UserCard } from '@/frontend/features/users/components/UserCard';
```

## 命名規則

### ファイル名

* **コンポーネント**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
* **ユーティリティ/フック**: camelCase (`useAuth.ts`, `formatDate.ts`)
* **型定義**: インターフェース名と同じか、`types.ts`として集約
* **定数**: `constants.ts` または機能別 (`userConstants.ts`)

### 変数・関数名

* **変数**: camelCase、説明的な名前を使用
* **ブール値**: `is`/`has`/`should` などの接頭辞を使用 (`isLoading`, `hasError`)
* **関数**: 動詞で始める (`getUserData`, `formatPrice`)
* **コンポーネント**: PascalCase、名詞 (`Button`, `UserCard`)
* **カスタムフック**: `use` で始める (`useAuth`, `useWindowSize`)

```tsx
// Good
const isLoading = true;
const handleSubmit = () => { /* ... */ };
function formatUserName(user) { /* ... */ }

// Bad
const loading = true; // ブール値に接頭辞がない
const submit = () => { /* ... */ }; // 動詞で始まっていない
```

## コンポーネント設計

### コンポーネントの分割

* **単一責任の原則**: 1つのコンポーネントは1つの責任を持つ
* **適切な粒度**: ロジックと表示の分離、再利用性を考慮
* **コンポーネントサイズ**: 200行を超える場合は分割を検討

### プロップス定義

* 明示的な型定義
* デフォルト値の設定
* 必須プロップスの明示

```tsx
type Props = {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  children,
  onClick
}: Props) {
  // ...
}
```

### コンポーネント構造

```tsx
// 1. インポート
import { useState } from 'react';
import { Button } from '@/frontend/shared/components/Button';

// 2. 型定義
type Props = {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
};

// 3. コンポーネント定義
export function UserForm({ initialData, onSubmit }: Props) {
  // 4. フック・状態
  const [name, setName] = useState(initialData?.name || '');
  
  // 5. イベントハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
  };
  
  // 6. 条件付きレンダリング
  if (!initialData && isRequired) {
    return <div>初期データが必要です</div>;
  }
  
  // 7. JSX
  return (
    <form onSubmit={handleSubmit}>
      {/* JSXの内容 */}
    </form>
  );
}
```

## 状態管理

### ローカル状態

* シンプルな状態には `useState`
* 複雑な状態には `useReducer`
* 派生状態にはメモ化 (`useMemo`)

```tsx
// 単純な状態
const [isOpen, setIsOpen] = useState(false);

// 複雑な状態
const [state, dispatch] = useReducer(reducer, initialState);

// 派生状態
const filteredItems = useMemo(() => {
  return items.filter(item => item.status === status);
}, [items, status]);
```

### グローバル状態

* 必要最小限の状態だけをグローバルに
* 適切なスコープでの状態分割
* コンテキストの適切な使用

```tsx
// Zustandを使った状態管理の例
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await apiLogin(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    await apiLogout();
    set({ user: null, isLoading: false });
  }
}));
```

## 型定義

### 基本原則

* すべての変数、関数、コンポーネントに型を付ける
* `any` の使用を避ける
* Union型を活用する
* 再利用可能な型は共有する

### 型定義の方針

* 基本的に `type` を使用する
* 拡張が必要な場合のみ `interface` を使用
* 列挙型には `const オブジェクト + type` パターンを使用

```ts
// Good: typeで定義
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
};

// Good: constオブジェクト + typeパターン
export const UserRoleEnum = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;
export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

// 必要な場合のみinterfaceを使用（拡張が必要な場合など）
export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// 実装例
export class UserRepository implements BaseRepository<User> {
  // メソッドの実装
}
```

### 型定義の場所

* 共通型: `src/types/`
* ドメインモデル: `src/domain/{モジュール名}/`
* 列挙型: `src/enums/`
* 機能固有型: 該当機能内またはドメインモデル内

```ts
// src/enums/user-auth/userRole.enum.ts
export const UserRoleEnum = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;
export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

// src/domain/user/user.viewModel.ts
import { UserRoleEnum } from '@/enums/user-auth/userRole.enum';
import { z } from 'zod';

// Zodスキーマを使った型定義
const userViewModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRoleEnum)
});

export type UserViewModel = z.infer<typeof userViewModelSchema>;
```

### ファイル命名規則

* 型定義: `{名前}.type.ts`
* 列挙型: `{名前}.enum.ts`
* ビューモデル: `{名前}.viewModel.ts`
* モデル: `{名前}.model.ts`
* エンティティ: `{名前}.entity.ts`
* ユーティリティ: `{名前}.util.ts`
* アクション: `{名前}.action.ts`

## コメント

### コメントの原則

* コードは自己説明的にする
* **なぜ**そうしているかを説明する（**何を**しているかは通常不要）
* 複雑なロジックには説明を加える
* TODO コメントには理由と期限を含める

```ts
// Good
// ユーザーが30日以上ログインしていない場合は非アクティブとみなす
const isInactive = daysSinceLastLogin > 30;

// Bad
// ユーザー名を設定
setUsername(name);

// TODO: パフォーマンス最適化が必要（2023年Q2対応予定）
function heavyCalculation() {
  // ...
}
```

### JSDoc

複雑な関数やAPIには JSDoc を使用：

```ts
/**
 * ユーザーデータを取得し、統計情報を付加します
 * 
 * @param userId - 取得するユーザーのID
 * @param includeActivity - アクティビティ履歴を含めるかのフラグ
 * @returns 拡張されたユーザー情報とアクティビティ（要求された場合）
 * @throws {ApiError} ユーザーが見つからない場合
 */
async function getUserWithStats(
  userId: string, 
  includeActivity = false
): Promise<UserWithStats> {
  // 実装...
}
```

## テスト

### テスト構造

* ユニットテスト: 個々の関数やコンポーネント
* 統合テスト: コンポーネント間の相互作用
* E2Eテスト: ユーザーフローの検証

### テストファイル配置

* テストファイルは対象のコードファイルと同じディレクトリに配置
* ファイル名は `[対象].test.ts` または `[対象].spec.ts`

```
src/frontend/features/users/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.test.tsx
├── hooks/
│   ├── useUsers.ts
│   └── useUsers.test.ts
```

### テスト記述スタイル

```tsx
// src/frontend/shared/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('クリックイベントを発火する', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <Button onClick={handleClick}>クリック</Button>
    );
    
    fireEvent.click(getByRole('button', { name: 'クリック' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('無効状態で正しくレンダリングされる', () => {
    const { getByRole } = render(
      <Button disabled>無効</Button>
    );
    
    const button = getByRole('button', { name: '無効' });
    expect(button).toBeDisabled();
  });
});
```

## スタイリング

### CSS規約

* TailwindCSSを使用
* 複雑なコンポーネントは CSS Modules を検討
* グローバルスタイルは最小限に

### コンポーネントのスタイル

```tsx
// シンプルなコンポーネント: インラインでTailwindクラスを使用
function Badge({ label, variant = 'info' }) {
  const baseClasses = 'px-2 py-1 rounded text-xs font-semibold';
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}
```

### レスポンシブデザイン

* モバイルファーストアプローチ
* 標準的なブレークポイントの使用

```tsx
// モバイルファーストアプローチの例
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  gap-4
">
  {/* コンテンツ */}
</div>
``` 