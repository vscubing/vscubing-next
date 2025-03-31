import { postRouter } from '@/server/api/routers/post'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { contestRouter } from './routers/contest'
import { userRouter } from './routers/user'
import { roundAttempt } from './routers/round-attempt'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  contest: contestRouter,
  roundAttempt: roundAttempt,
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
