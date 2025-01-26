import { useCurrentUser } from '../hooks/useCurrentUser';

export const UserProfile = () => {
  const { user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <div>
      <h2>プロフィール</h2>
      <dl>
        <dt>ニックネーム</dt>
        <dd>{user.nickname}</dd>
        <dt>作成日</dt>
        <dd>{user.createdAt.toLocaleDateString()}</dd>
        <dt>更新日</dt>
        <dd>{user.updatedAt.toLocaleDateString()}</dd>
      </dl>
    </div>
  );
};
