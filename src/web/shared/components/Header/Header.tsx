import { Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Subsy
        </Link>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
