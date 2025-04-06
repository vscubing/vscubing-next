import { type Discipline, SCRAMBLE_POSITIONS } from '@/app/_types'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
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
    const now = dayjs()
    const [oldOngoing] = await tx
      .update(contestTable)
      .set({ isOngoing: false, endDate: now.toISOString() })
      .where(eq(contestTable.isOngoing, true))
      .returning({ slug: contestTable.slug })

    if (!oldOngoing) throw new Error('No ongoing contest!')

    const nextContestNumber = Number(oldOngoing.slug) + 1
    const newContestSlug = String(nextContestNumber)

    await tx.insert(contestTable).values({
      slug: newContestSlug,
      isOngoing: true,
      startDate: now.toISOString(),
      expectedEndDate: now.add(7, 'day').toISOString(),
    })

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
