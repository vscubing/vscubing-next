import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  isAdmin,
  publicProcedure,
} from '@/backend/api/trpc'
import {
  contestTable,
  roundSessionTable,
  roundTable,
  solveTable,
  userMetadataTable,
  userTable,
} from '@/backend/db/schema'
import { validateSolve } from '@/backend/shared/validate-solve'
import { calculateAvg } from '@/backend/shared/calculate-avg'
import { DISCIPLINES, resultDnfable } from '@/types'
import { ROUND_ATTEMPTS_QTY } from './round-session'
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
  sql,
  aliasedTable,
  and,
  not,
  getTableColumns,
  desc,
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
          type: 'weekly',
        })
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
          type: 'weekly',
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
        .where(
          eq(sql`lower(${userTable.name})`, input.sourceUserName.toLowerCase()),
        )
      if (!sourceUser)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `no source with name ${input.sourceUserName}`,
        })

      const [targetUser] = await ctx.db
        .select()
        .from(userTable)
        .where(
          eq(sql`lower(${userTable.name})`, input.targetUserName.toLowerCase()),
        )
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
  getSuspendedUsers: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({ userId: userTable.id, username: userTable.name })
      .from(userMetadataTable)
      .innerJoin(userTable, eq(userTable.id, userMetadataTable.userId))
      .where(eq(userMetadataTable.suspended, true))
      .orderBy(userTable.name)
  }),
  suspendUser: adminProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [user] = await ctx.db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(sql`lower(${userTable.name})`, input.username.toLowerCase()))
      if (!user)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `no user with name ${input.username}`,
        })

      await ctx.db
        .insert(userMetadataTable)
        .values({ userId: user.id, suspended: true })
        .onConflictDoUpdate({
          target: userMetadataTable.userId,
          set: { suspended: true },
        })
    }),
  unsuspendUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(userMetadataTable)
        .set({ suspended: false })
        .where(eq(userMetadataTable.userId, input.userId))
    }),
  getSolveById: adminProcedure
    .input(z.object({ solveId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          solveId: solveTable.id,
          timeMs: solveTable.timeMs,
          isDnf: solveTable.isDnf,
          status: solveTable.status,
          contestSlug: roundTable.contestSlug,
          discipline: roundTable.disciplineSlug,
          username: userTable.name,
        })
        .from(solveTable)
        .innerJoin(
          roundSessionTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(roundTable, eq(roundSessionTable.roundId, roundTable.id))
        .innerJoin(userTable, eq(roundSessionTable.contestantId, userTable.id))
        .where(eq(solveTable.id, input.solveId))

      if (!row)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `no solve with id ${input.solveId}`,
        })
      return row
    }),
  setSolveDnf: adminProcedure
    .input(z.object({ solveId: z.number(), isDnf: z.boolean() }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const [solve] = await tx
          .select({
            timeMs: solveTable.timeMs,
            status: solveTable.status,
            roundSessionId: solveTable.roundSessionId,
          })
          .from(solveTable)
          .where(eq(solveTable.id, input.solveId))
        if (!solve)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `no solve with id ${input.solveId}`,
          })

        if (!input.isDnf && solve.timeMs === null)
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Can't un-DNF a solve with no recorded time.",
          })

        await tx
          .update(solveTable)
          .set({ isDnf: input.isDnf })
          .where(eq(solveTable.id, input.solveId))

        // the round session's avg is a cached snapshot computed once all
        // ROUND_ATTEMPTS_QTY solves are submitted, so it needs recomputing
        // whenever a counted (submitted) solve's DNF status changes after the fact
        if (solve.status === 'submitted') {
          const submittedResults = (
            await tx
              .select({ isDnf: solveTable.isDnf, timeMs: solveTable.timeMs })
              .from(solveTable)
              .where(
                and(
                  eq(solveTable.roundSessionId, solve.roundSessionId),
                  eq(solveTable.status, 'submitted'),
                ),
              )
          ).map((res) => resultDnfable.parse(res))

          if (submittedResults.length === ROUND_ATTEMPTS_QTY) {
            const { timeMs: avgMs, isDnf } = calculateAvg(submittedResults)
            await tx
              .update(roundSessionTable)
              .set({ avgMs, isDnf })
              .where(eq(roundSessionTable.id, solve.roundSessionId))
          }
        }
      }),
    ),
  getExtraSolves: adminProcedure
    .input(z.object({ cursor: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const limit = 10
      const cursor = input?.cursor

      const rows = await ctx.db
        .select({
          solveId: solveTable.id,
          timeMs: solveTable.timeMs,
          isDnf: solveTable.isDnf,
          extraReason: solveTable.extraReason,
          createdAt: solveTable.createdAt,
          contestSlug: roundTable.contestSlug,
          discipline: roundTable.disciplineSlug,
          username: userTable.name,
        })
        .from(solveTable)
        .innerJoin(
          roundSessionTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(roundTable, eq(roundSessionTable.roundId, roundTable.id))
        .innerJoin(userTable, eq(roundSessionTable.contestantId, userTable.id))
        .where(
          cursor
            ? and(
                eq(solveTable.status, 'changed_to_extra'),
                sql`${solveTable.id} < ${cursor}`,
              )
            : eq(solveTable.status, 'changed_to_extra'),
        )
        .orderBy(desc(solveTable.id))
        .limit(limit + 1)

      const hasMore = rows.length > limit
      if (hasMore) rows.pop()
      const nextCursor = hasMore ? rows[rows.length - 1]!.solveId : undefined

      return { items: rows, nextCursor }
    }),
})
