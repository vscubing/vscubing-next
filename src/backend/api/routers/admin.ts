import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  isAdmin,
  publicProcedure,
} from '@/backend/api/trpc'
import {
  contestTable,
  disciplineTable,
  roundSessionTable,
  userTable,
} from '@/backend/db/schema'
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
import {
  exists,
  eq,
  aliasedTable,
  and,
  not,
  getTableColumns,
} from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

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
  validateSolve: adminProcedure
    .input(
      z.object({
        scramble: z.string(),
        solution: z.string(),
        discipline: z.enum(DISCIPLINES),
      }),
    )
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input, ctx }) => {
      const latestContest = await getLatestContest()

      if (!latestContest) throw new Error('no latest contest found')
      if (latestContest.isOngoing)
        throw new Error(
          'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
        )

      return ctx.db.transaction((tx) =>
        createNewContest({
          tx,
          easyScrambles: input.easyScrambles,
          slug: getNextContestSlug(latestContest.slug),
        }),
      )
    }),
  closeOngoingContest: adminProcedure.mutation(async () =>
    closeOngoingContest(),
  ),
  getLatestContest: adminProcedure.query(async () => getLatestContest()), // this would return the latest non-ongoing contest in case there is no ongoing one
  transferUserResults: adminProcedure
    .input(z.object({ targetUserName: z.string(), sourceUserName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [sourceUser] = await ctx.db
        .select()
        .from(userTable)
        .where(eq(userTable.name, input.sourceUserName))
      if (!sourceUser)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `no source with name ${input.sourceUserName}`,
        })

      const [targetUser] = await ctx.db
        .select()
        .from(userTable)
        .where(eq(userTable.name, input.targetUserName))
      if (!targetUser)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `no target with name ${input.targetUserName}`,
        })

      console.log(
        `[ADMIN] Transfering ${input.sourceUserName}'s results to ${input.targetUserName}...`,
      )

      const aliasedRoundSessionTable = aliasedTable(
        roundSessionTable,
        'rs_outer',
      )
      const merged = await ctx.db
        .update(aliasedRoundSessionTable)
        .set({ contestantId: targetUser.id })
        .where(
          and(
            eq(aliasedRoundSessionTable.contestantId, sourceUser.id),
            not(
              exists(
                ctx.db
                  .select()
                  .from(roundSessionTable)
                  .where(
                    and(
                      eq(
                        roundSessionTable.roundId,
                        aliasedRoundSessionTable.roundId,
                      ),
                      eq(roundSessionTable.contestantId, targetUser.id),
                    ),
                  ),
              ),
            ),
          ),
        )
        .returning(getTableColumns(aliasedRoundSessionTable))
      const mergedArr = Array.from(merged.values())

      const mergedMsg = `[ADMIN] Merged ${mergedArr.length} results: ${JSON.stringify(mergedArr)}`
      console.log(mergedMsg, '\n')

      const conflict = await ctx.db
        .select()
        .from(roundSessionTable)
        .where(eq(roundSessionTable.contestantId, sourceUser.id))
      const conflictMsg = `[ADMIN] Couldn't merge ${conflict.length} results: ${JSON.stringify(conflict)}`
      console.log(conflictMsg)

      return { mergedMsg, conflictMsg }
    }),
})
