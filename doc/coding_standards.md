# コーディング規約

## 目次

1. [命名規則](#命名規則)
2. [コンポーネント設計](#コンポーネント設計)
3. [状態管理](#状態管理)
4. [型定義](#型定義)
5. [コメント](#コメント)
6. [テスト](#テスト)
7. [スタイリング](#スタイリング)

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
import { Button } from '@/frontend/shared/components/ui/Button';

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
  const handleSubmit = (e: React.FormEvent) => {
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
* React Context APIの適切な使用

```tsx
// Contextを使った状態管理の例
import { createContext, useContext, useReducer, ReactNode } from 'react';

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials: Credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await apiLogin(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };
  
  const logout = async () => {
    await apiLogout();
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
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
  role: UserRole;
};

// Good: constオブジェクト + typeパターン
export const UserRole = {
  Admin: 'Admin',
  Manager: 'Manager',
  User: 'User'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// 必要な場合のみinterfaceを使用（拡張が必要な場合など）
export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

### 型定義の場所

* 共通型: `src/shared/types/`
* ドメインモデル: `src/shared/domain/`
* 列挙型: `src/shared/enums/`
* 機能固有型: 該当機能内

```ts
// src/shared/domain/user.ts
import { UserRole } from '@/shared/enums/userRole';
import { z } from 'zod';

// Zodスキーマを使った型定義
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole)
});

export type User = z.infer<typeof userSchema>;
```

## コメント

### コメントの原則

* コードは自己説明的にする
* **なぜ**そうしているかを説明する（**何を**しているかは通常不要）
* 複雑なロジックには説明を加える
* TODO コメントには理由を含める

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
* ファイル名は `[対象].spec.ts`

```
src/frontend/features/users/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.spec.tsx
├── hooks/
│   ├── useUsers.ts
│   └── useUsers.spec.ts
```

### テスト記述スタイル

```tsx
// src/frontend/shared/components/ui/Button.spec.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('クリックイベントを発火する', () => {
    const handleClick = vi.fn();
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
* shadcn/uiコンポーネントを活用
* グローバルスタイルは最小限に

### コンポーネントのスタイル

```tsx
// シンプルなコンポーネント: インラインでTailwindクラスを使用
import { cn } from "@/shared/lib/utils";

type BadgeProps = {
  label: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
};

export function Badge({ 
  label, 
  variant = 'info',
  className 
}: BadgeProps) {
  const baseClasses = 'px-2 py-1 rounded text-xs font-semibold';
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={cn(baseClasses, variantClasses[variant], className)}>
      {label}
    </span>
  );
}
```

### レスポンシブデザイン

* モバイルファーストアプローチ
* Tailwindの標準的なブレークポイントの使用

```tsx
// モバイルファーストアプローチの例
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* コンテンツ */}
</div>
``` 