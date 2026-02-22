import { honoClient } from '@/shared/lib/hono/hono';
import type { CurrentUser } from '@/web/shared/types/user';
import useSWR from 'swr';

export type UseCurrentUserReturn = {
  user: CurrentUser | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<CurrentUser | undefined>;
};

const fetchCurrentUser = async (): Promise<CurrentUser> => {
  const response = await honoClient.api.users.me.$get();

  if (!response.ok) {
    throw new Error('ユーザー情報の取得に失敗しました');
  }
  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};

// 即時実行バージョン
export const useCurrentUser = (): UseCurrentUserReturn => {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<CurrentUser>('currentUser', fetchCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 5, // 5分間重複リクエストを防ぐ
  });

  return {
    user,
    isLoading,
    error,
    refresh: () => mutate(),
  };
};

// 遅延実行バージョン
export const useLazyCurrentUser = (): UseCurrentUserReturn & {
  fetch: () => Promise<CurrentUser | undefined>;
} => {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<CurrentUser>(null, fetchCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 5,
  });

  return {
    user,
    isLoading,
    error,
    refresh: () => mutate(),
    fetch: () => mutate(),
  };
};

// Suspense対応バージョン
export const useCurrentUserSuspense = (): Omit<UseCurrentUserReturn, 'isLoading'> => {
  const {
    data: user,
    error,
    mutate,
  } = useSWR<CurrentUser>('currentUser', fetchCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 5,
    suspense: true,
  });

  return {
    user,
    error,
    refresh: () => mutate(),
  };
};
