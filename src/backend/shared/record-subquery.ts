import { eq, and, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../db'
import {
  roundTable,
  roundSessionTable,
  contestTable,
  solveTable,
  userTable,
} from '../db/schema'
import { resultDnfish, type Discipline, type ResultDnfish } from '@/types'

export async function getGlobalRecords() {
  const averages = await db
    .selectDistinctOn([roundTable.disciplineSlug], {
      roundSession: getTableColumns(roundSessionTable),
      userId: sql<string>`${userTable.id}`.as('user_id'),
      discipline: roundTable.disciplineSlug,
      contestSlug: contestTable.slug,
    })
    .from(roundSessionTable)
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(roundSessionTable.isFinished, true),
        eq(contestTable.isOngoing, false), // TODO: remove this once we make leaderboards update immediately and not after a contest ends
      ),
    )
    .orderBy(
      roundTable.disciplineSlug,
      roundSessionTable.isDnf,
      roundSessionTable.avgMs,
    )

  const singles = await db
    .selectDistinctOn([roundTable.disciplineSlug], {
      solve: getTableColumns(solveTable),
      userId: sql<string>`${userTable.id}`.as('user_id'),
      discipline: roundTable.disciplineSlug,
      contestSlug: contestTable.slug,
    })
    .from(solveTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.id, solveTable.roundSessionId),
    )
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(solveTable.status, 'submitted'),
        eq(contestTable.isOngoing, false), // TODO: remove this once we make leaderboards update immediately and not after a contest ends
      ),
    )
    .orderBy(roundTable.disciplineSlug, solveTable.isDnf, solveTable.timeMs)

  return { singles, averages }
}

export async function getGlobalRecordsByUser(): Promise<
  Map<string, UserGlobalRecords>
> {
  const { averages: averagesRaw, singles: singlesRaw } =
    await getGlobalRecords()
  const averages = averagesRaw.map((avg) => ({
    ...avg,
    roundSession: {
      ...avg.roundSession,
      result: resultDnfish.parse({
        timeMs: avg.roundSession.avgMs,
        isDnf: avg.roundSession.isDnf,
      }),
    },
  }))
  const singles = singlesRaw.map((single) => ({
    ...single,
    solve: {
      ...single.solve,
      result: resultDnfish.parse({
        timeMs: single.solve.timeMs,
        isDnf: single.solve.isDnf,
        plusTwoIncluded: single.solve.plusTwoIncluded,
      }),
    },
  }))

  const map = new Map<
    string,
    { singles: typeof singles; averages: typeof averages }
  >()

  for (const average of averages) {
    if (!map.has(average.userId))
      map.set(average.userId, { singles: [], averages: [] })
    map.get(average.userId)!.averages.push(average)
  }

  for (const single of singles) {
    if (!map.has(single.userId))
      map.set(single.userId, { singles: [], averages: [] })
    map.get(single.userId)!.singles.push(single)
  }

  return map
}

export type UserGlobalRecords = {
  singles: {
    solve: {
      id: number
      roundSessionId: number
      result: ResultDnfish
    }
    userId: string
    discipline: Discipline
    contestSlug: string
  }[]
  averages: {
    roundSession: {
      id: number
      result: ResultDnfish
    }
    userId: string
    discipline: Discipline
    contestSlug: string
  }[]
}
