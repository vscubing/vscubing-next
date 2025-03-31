import dayjs from 'dayjs'
import type { db as dbType } from '.'
import { contestTable, disciplineTable } from './schema'
import { tryCatch } from '@/app/_utils/try-catch'

export async function seedDb(db: typeof dbType) {
  const { error } = await tryCatch(
    db.transaction(async (t) => {
      // this contest is initial and has no disciplines, so it won't be visible anywhere, but is necessary because the app expects an ongoing contest the previous contest's slug to compute the next
      await t
        .insert(contestTable)
        .values({
          isOngoing: true,
          startDate: dayjs().toISOString(),
          expectedEndDate: dayjs().toISOString(),
          slug: '0',
        })
        .onConflictDoNothing()

      await t
        .insert(disciplineTable)
        .values([{ slug: '3by3' }, { slug: '2by2' }])
        .onConflictDoNothing()
    }),
  )
  if (error) {
    console.error('[SEEDING] error:')
    throw error
  }
}
