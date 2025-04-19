import { DISCIPLINES, SCRAMBLE_POSITIONS, type Discipline } from '@/types'
import dayjs from 'dayjs'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { contestTable, roundTable, scrambleTable } from '../db/schema'
import { env } from '@/env'
import { posthogClient } from '../posthog'
import { generateScrambles } from './generate-scrambles'

const PREFIX = '[CONTEST_MANAGEMENT]'
export const NO_ONGOING_CONTEST_ERROR_MESSAGE = `${PREFIX} no ongoing contest. Please create one manually from the developer tools`
export async function closeOngoingAndCreateNewContest(
  {
    easyScrambles,
  }: {
    easyScrambles?: boolean
  } = { easyScrambles: false },
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
  const disciplines = DISCIPLINES
  const now = dayjs()
  await tx.insert(contestTable).values({
    slug,
    isOngoing: true,
    startDate: now.toISOString(),
    expectedEndDate: now.add(7, 'day').toISOString(),
  })
  console.log(`${PREFIX} created Contest ${slug}`)
  posthogClient.groupIdentify({
    groupType: 'contest',
    groupKey: slug,
    properties: {
      distinctId: undefined,
      disciplines,
      startDate: now.toDate(),
    },
  })

  const createdRounds = await tx
    .insert(roundTable)
    .values(
      disciplines.map((discipline) => ({
        contestSlug: slug,
        disciplineSlug: discipline,
      })),
    )
    .returning({
      id: roundTable.id,
      discipline: roundTable.disciplineSlug,
    })
  console.log(
    `${PREFIX} inserted disciplines ${createdRounds.map((d) => d.discipline).join(', ')} into Contest ${slug}`,
  )
  for (const { discipline, id } of createdRounds) {
    posthogClient.groupIdentify({
      groupType: 'discipline',
      distinctId: undefined,
      groupKey: discipline,
    })
    posthogClient.groupIdentify({
      groupType: 'round',
      distinctId: undefined,
      groupKey: String(id),
      properties: { discipline },
    })
  }

  const scrambleRows: (typeof scrambleTable.$inferInsert & {
    discipline: Discipline
  })[] = []
  for (const { id, discipline } of createdRounds) {
    const scrambles = easyScrambles
      ? generateEasyScrambles(7)
      : await generateScrambles(discipline, 7)
    for (const [idx, scramble] of scrambles.entries()) {
      scrambleRows.push({
        roundId: id,
        position: SCRAMBLE_POSITIONS[idx]!,
        moves: scramble,
        discipline,
      })
    }
  }
  console.log(
    `${PREFIX} generated ${easyScrambles ? 'easy ' : ''}scrambles for Contest ${slug}`,
  )
  console.log(scrambleRows)

  const scrambles = await tx
    .insert(scrambleTable)
    .values(scrambleRows)
    .returning({ id: scrambleTable.id, roundId: scrambleTable.roundId })

  for (const [idx, { id, roundId }] of scrambles.entries()) {
    posthogClient.groupIdentify({
      groupType: 'scramble',
      groupKey: String(id),
      properties: { id, discipline: scrambleRows[idx]!.discipline, roundId },
    })
  }

  return { newContestSlug: slug }
}

export async function closeOngoingContest(
  tx: Transaction | typeof db = db,
): Promise<{ slug: string }> {
  console.log(`${PREFIX} closing the ongoing contest requested`)

  const latestContest = await getLatestContest()

  if (latestContest?.isOngoing !== true) {
    console.error(NO_ONGOING_CONTEST_ERROR_MESSAGE)
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
        systemInitial: contestTable.systemInitial,
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
  console.log(`${PREFIX} generating easy scrambles...`)
  if (env.NEXT_PUBLIC_APP_ENV === 'production') {
    console.error('attempted to generate easy scrambles in production!')
    throw new Error('attempted to generate easy scrambles in production!')
  }
  const moves = ['R', 'U', 'F', 'B', 'L', 'D']
  return Array.from({ length: count }).map(() => {
    const scr = []
    for (let i = 0; i < 3; i++) {
      scr.push(moves[Math.floor(Math.random() * 6)])
    }
    return scr.join(' ')
  })
}
