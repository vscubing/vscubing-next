import { type Discipline, SCRAMBLE_POSITIONS } from '@/app/_types'
import dayjs from 'dayjs'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import {
  contestTable,
  contestDisciplineTable,
  scrambleTable,
} from '../db/schema'
import { generateScrambles } from './generate-scrambles'
import { env } from '@/env'

export async function closeOngoingAndCreateNewContest(
  disciplines: Discipline[],
  easyScrambles = false,
) {
  await db.transaction(async (tx) => {
    console.log('[CONTEST CREATION] creating an ongoing contest')

    const [lastContest] = await tx
      .select({ slug: contestTable.slug, isOngoing: contestTable.isOngoing })
      .from(contestTable)
      .orderBy(desc(contestTable.expectedEndDate))
      .limit(1)

    if (!lastContest)
      throw new Error(
        '[CONTEST CREATION] no contests found, neither a system one or a real one',
      )

    const now = dayjs()
    if (lastContest?.isOngoing) {
      await tx
        .update(contestTable)
        .set({ isOngoing: false, endDate: now.toISOString() })
        .where(eq(contestTable.slug, lastContest.slug))
      console.log(`[CONTEST CREATION] closed Contest ${lastContest.slug}`)
    }

    const nextContestNumber = Number(lastContest.slug) + 1
    const newContestSlug = String(nextContestNumber)

    await tx.insert(contestTable).values({
      slug: newContestSlug,
      isOngoing: true,
      startDate: now.toISOString(),
      expectedEndDate: now.add(7, 'day').toISOString(),
    })
    console.log(`[CONTEST CREATION] created Contest ${newContestSlug}`)

    const createdContestDisciplines = await tx
      .insert(contestDisciplineTable)
      .values(
        disciplines.map((discipline) => ({
          contestSlug: newContestSlug,
          disciplineSlug: discipline,
        })),
      )
      .returning({
        id: contestDisciplineTable.id,
        discipline: contestDisciplineTable.disciplineSlug,
      })
    console.log(
      `[CONTEST CREATION] inserted disciplines ${createdContestDisciplines.map((d) => d.discipline).join(', ')} into Contest ${newContestSlug}`,
    )

    const scrambleRows: (typeof scrambleTable.$inferInsert)[] = []
    for (const { id, discipline } of createdContestDisciplines) {
      const scrambles = easyScrambles
        ? generateEasyScrambles(7)
        : await generateScrambles(discipline, 7)
      for (const [idx, scramble] of scrambles.entries()) {
        scrambleRows.push({
          contestDisciplineId: id,
          position: SCRAMBLE_POSITIONS[idx]!,
          moves: scramble,
        })
      }
    }
    console.log(
      `[CONTEST CREATION] generated ${easyScrambles ? 'easy ' : ''}scrambles`,
    )

    await tx.insert(scrambleTable).values(scrambleRows)
  })
}

function generateEasyScrambles(count: number) {
  if (env.NEXT_PUBLIC_APP_ENV === 'production')
    throw new Error('attempted to generate easy scrambles in production!')
  const moves = ['R', 'U', 'F', 'B', 'L', 'D']
  return Array.from({ length: count }).map(() => {
    const scr = []
    for (let i = 0; i < 3; i++) {
      scr.push(moves[Math.floor(Math.random() * 6)])
    }
    return scr.join(' ')
  })
}
