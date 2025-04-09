'use server'

import type { Discipline } from '@/types'
import { db } from '@/backend/db'
import { contestTable, disciplineTable } from '@/backend/db/schema'
import { validateSolve } from '@/backend/shared/validate-solve'
import dayjs from 'dayjs'
import { revalidatePath } from 'next/cache'

export async function createSystemInitialContest() {
  await db.transaction(async (t) => {
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

    revalidatePath('/dev')
  })
}

export type Solve = {
  scramble: string
  solution: string
  discipline: Discipline
}
export async function validateSolveAction(solve: Solve) {
  const { isValid, error } = await validateSolve(solve)
  if (isValid) return 'valid'
  else return `invalid. error: ${JSON.stringify(error)}`
}
