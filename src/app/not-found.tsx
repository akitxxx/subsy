import { Button } from '@/web/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/web/shared/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>ページが見つかりません</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">お探しのページは存在しないか、移動した可能性があります。</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/">トップページへ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
