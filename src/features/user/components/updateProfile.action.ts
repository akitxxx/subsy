import { honoClient } from '@/lib/hono/hono';

type Input = {
  nickname: string;
};
export const updateProfile = async ({ nickname }: Input) => {
  const res = await honoClient.api.users.me.$patch({ json: { nickname } });

  if (!res.ok) {
    const errorResponse = await res.json();
    throw new Error(errorResponse.error.detail || 'システムエラーが発生しました');
  }

  const user = await res.json();
  return user;
};
