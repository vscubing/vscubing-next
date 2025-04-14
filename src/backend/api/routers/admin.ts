import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  isAdmin,
  publicProcedure,
} from '@/backend/api/trpc'
import { contestTable, disciplineTable } from '@/backend/db/schema'
import { validateSolve } from '@/backend/shared/validate-solve'
import { DISCIPLINES } from '@/types'
import dayjs from 'dayjs'
import {
  closeOngoingAndCreateNewContest,
  closeOngoingContest,
  createNewContest,
  getLatestContest,
  getNextContestSlug,
} from '@/backend/shared/contest-management'

export const adminRouter = createTRPCRouter({
  authorized: publicProcedure.query(({ ctx }) => isAdmin(ctx.session?.user)),
  createSystemInitialContest: adminProcedure.mutation(async ({ ctx }) =>
    ctx.db.transaction(async (t) => {
      await t
        .insert(contestTable)
        .values({
          isOngoing: true,
          startDate: dayjs().toISOString(),
          expectedEndDate: dayjs().toISOString(),
          slug: '0',
          systemInitial: true,
        })
        .onConflictDoNothing()

      await t
        .insert(disciplineTable)
        .values([{ slug: '3by3' }, { slug: '2by2' }])
        .onConflictDoNothing()
    }),
  ),
  validateSolveAction: adminProcedure
    .input(
      z.object({
        scramble: z.string(),
        solution: z.string(),
        discipline: z.enum(DISCIPLINES),
      }),
    )
    .query(async ({ input }) => {
      const { isValid, error } = await validateSolve(input)
      if (isValid) return 'valid'
      else return `invalid. error: ${JSON.stringify(error)}`
    }),
  closeOngoingAndCreateNewContest: adminProcedure
    .input(z.object({ easyScrambles: z.boolean().optional().default(false) }))
    .mutation(async ({ input }) => closeOngoingAndCreateNewContest(input)),
  createNewContest: adminProcedure
    .input(
      z.object({
        easyScrambles: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const latestContest = await getLatestContest()

      if (!latestContest) throw new Error('no latest contest found')
      if (latestContest.isOngoing)
        throw new Error(
          'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
        )

      return createNewContest({
        easyScrambles: input.easyScrambles,
        slug: getNextContestSlug(latestContest.slug),
      })
    }),
  closeOngoingContest: adminProcedure.mutation(async () =>
    closeOngoingContest(),
  ),
  getLatestContest: adminProcedure.query(async () => getLatestContest()),
})
