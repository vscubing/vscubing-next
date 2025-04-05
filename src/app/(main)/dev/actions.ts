'use server'

import { db } from '@/server/db'
import { contestTable, disciplineTable } from '@/server/db/schema'
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
