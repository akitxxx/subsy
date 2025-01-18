// import type { DrizzleClient } from '@/lib/db/drizzle';
// import { userAuthsTable, usersTable } from '@/lib/db/schema';
// import { and, eq } from 'drizzle-orm';
// import { jwtVerify, SignJWT } from 'jose';
// import { OAuth2Client } from 'google-auth-library';

// type Inject = {
//   db: DrizzleClient;
// };

// type Input = {
//   credential: string;
// };

// type Output = {
//   userId: string;
//   token: string;
//   nickname: string;
// };

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!GOOGLE_CLIENT_ID) {
//   throw new Error('GOOGLE_CLIENT_ID is not defined');
// }

// if (!JWT_SECRET) {
//   throw new Error('JWT_SECRET is not defined');
// }

// const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// const run =
//   ({ db }: Inject) =>
//   async ({ credential }: Input): Promise<Output> => {
//     // Google IDトークンの検証
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload) {
//       throw new Error('Invalid credential');
//     }

//     const { sub: googleId, name } = payload;
//     if (!name) {
//       throw new Error('Required fields are missing');
//     }

//     // ユーザー認証情報の取得
//     const userAuth = await db
//       .select({
//         user: usersTable,
//         auth: userAuthsTable,
//       })
//       .from(userAuthsTable)
//       .innerJoin(usersTable, eq(userAuthsTable.userId, usersTable.id))
//       .where(
//         and(
//           eq(userAuthsTable.provider, 'google'),
//           eq(userAuthsTable.providerId, googleId),
//         ),
//       )
//       .then((rows) => rows[0]);

//     let userId: string;
//     let nickname: string;

//     if (!userAuth) {
//       // 新規ユーザーの作成
//       const [user] = await db
//         .insert(usersTable)
//         .values({
//           nickname: name,
//         })
//         .returning();

//       // 認証情報の作成
//       await db.insert(userAuthsTable).values({
//         userId: user.id,
//         provider: 'google',
//         providerId: googleId,
//       });

//       userId = user.id;
//       nickname = user.nickname;
//     } else {
//       userId = userAuth.user.id;
//       nickname = userAuth.user.nickname;
//     }

//     // JWTトークンの生成
//     const token = await new SignJWT({ userId })
//       .setProtectedHeader({ alg: 'HS256' })
//       .setIssuedAt()
//       .setExpirationTime('24h')
//       .sign(new TextEncoder().encode(JWT_SECRET));

//     return {
//       userId,
//       token,
//       nickname,
//     };
//   };

// export const GoogleAuthUsecase = { run };
