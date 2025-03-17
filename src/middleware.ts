import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};

// apiはhono側のmiddlewareにて処理を行うため対象外とする
const isPublicRoute = createRouteMatcher(['/_next', '/favicon.ico', '/sign-in(.*)', '/sign-up(.*)', '/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 公開パスはスキップ
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
