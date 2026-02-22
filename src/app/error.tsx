'use client';

import { Button } from '@/web/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/web/shared/components/ui/card';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error);
  }, [error]);

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">申し訳ありません。予期せぬエラーが発生しました。</p>
          <p className="text-sm text-muted-foreground/80">エラー内容: {error.message}</p>
          {error.digest && <p className="text-xs text-muted-foreground/60 mt-1">エラーID: {error.digest}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleHomeClick}>
            トップページへ
          </Button>
          <Button onClick={() => reset()}>再試行</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
