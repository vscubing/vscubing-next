import { DISCIPLINES, SCRAMBLE_POSITIONS } from '@/types'
import dayjs from 'dayjs'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  contestTable,
  contestDisciplineTable,
  scrambleTable,
} from '../db/schema'
import { generateScrambles } from './generate-scrambles'
import { env } from '@/env'
import { sendTelegramMessage } from './telegram'

const PREFIX = '[ONGOING CONTEST ADMIN]'
export const NO_ONGOING_CONTEST_ERROR_MESSAGE = `${PREFIX} no ongoing contest. Please create one manually from the developer tools`
export async function closeOngoingAndCreateNewContest(
  easyScrambles = false,
): Promise<{ newContestSlug: string }> {
  return await db.transaction(async (tx) => {
    console.log(`${PREFIX} closeOngoingAndCreateNewContest start`)

    const ongoing = await closeOngoingContest(tx)

    return createNewContest({
      slug: getNextContestSlug(ongoing.slug),
      tx,
      easyScrambles,
    })
  })
}

export type Transaction = Parameters<
  Parameters<(typeof db)['transaction']>[0]
>[0]
export async function createNewContest({
  slug,
  tx = db,
  easyScrambles = false,
}: {
  slug: string
  tx?: Transaction | typeof db
  easyScrambles?: boolean
}) {
  const now = dayjs()
  await tx.insert(contestTable).values({
    slug,
    isOngoing: true,
    startDate: now.toISOString(),
    expectedEndDate: now.add(7, 'day').toISOString(),
  })
  console.log(`${PREFIX} created Contest ${slug}`)

  const createdContestDisciplines = await tx
    .insert(contestDisciplineTable)
    .values(
      DISCIPLINES.map((discipline) => ({
        contestSlug: slug,
        disciplineSlug: discipline,
      })),
    )
    .returning({
      id: contestDisciplineTable.id,
      discipline: contestDisciplineTable.disciplineSlug,
    })
  console.log(
    `${PREFIX} inserted disciplines ${createdContestDisciplines.map((d) => d.discipline).join(', ')} into Contest ${slug}`,
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
    `${PREFIX} generated ${easyScrambles ? 'easy ' : ''}scrambles for Contest ${slug}`,
  )

  await tx.insert(scrambleTable).values(scrambleRows)
  return { newContestSlug: slug }
}

export async function closeOngoingContest(
  tx: Transaction | typeof db = db,
): Promise<{ slug: string }> {
  console.log(`${PREFIX} closing the ongoing contest requested`)

  const latestContest = await getLatestContest()

  if (latestContest?.isOngoing !== true) {
    console.log(NO_ONGOING_CONTEST_ERROR_MESSAGE)
    throw new Error(NO_ONGOING_CONTEST_ERROR_MESSAGE)
  }

  await tx
    .update(contestTable)
    .set({ isOngoing: false, endDate: dayjs().toISOString() })
    .where(eq(contestTable.slug, latestContest.slug))
    .returning({ endDate: contestTable.endDate })

  console.log(`${PREFIX} closed Contest ${latestContest.slug}`)

  return latestContest
}

export async function getLatestContest() {
  return (
    await db
      .select({
        slug: contestTable.slug,
        isOngoing: contestTable.isOngoing,
      })
      .from(contestTable)
      .orderBy(desc(contestTable.endDate))
      .limit(1)
  )?.[0]
}

export function getNextContestSlug(lastContestSlug: string) {
  return String(Number(lastContestSlug) + 1)
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
