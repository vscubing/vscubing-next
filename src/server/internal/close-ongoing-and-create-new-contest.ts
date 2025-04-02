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

export async function closeOngoingAndCreateNewContest(
  disciplines: Discipline[],
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
      for (const [idx, moves] of (
        await generateScrambles(discipline, 7)
      ).entries()) {
        scrambleRows.push({
          contestDisciplineId: id,
          position: SCRAMBLE_POSITIONS[idx]!,
          moves,
        })
      }
    }

    await tx.insert(scrambleTable).values(scrambleRows)
  })
}
