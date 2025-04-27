import { createCallerFactory, createTRPCRouter } from '@/backend/api/trpc'
import { contestRouter } from './routers/contest'
import { userRouter } from './routers/user'
import { roundSessionRouter } from './routers/round-session'
import { leaderboardRouter } from './routers/leaderboard'
import { settingsRouter } from './routers/settings'
import { adminRouter } from './routers/admin'
import { specialContestRouter } from './routers/special-contest'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  contest: contestRouter,
  specialContest: specialContestRouter,
  roundSession: roundSessionRouter,
  leaderboard: leaderboardRouter,
  settings: settingsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
