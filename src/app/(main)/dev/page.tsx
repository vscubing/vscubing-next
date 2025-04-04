import { PrimaryButton, SecondaryButton } from '@/app/_components/ui'
import { db } from '@/server/db'
import { contestTable, disciplineTable } from '@/server/db/schema'
import { closeOngoingAndCreateNewContest } from '@/server/internal/close-ongoing-and-create-new-contest'
import dayjs from 'dayjs'

export default function DevPage() {
  return (
    <>
      <form
        action={async () => {
          'use server'
          await closeOngoingAndCreateNewContest(['3by3', '2by2'])
        }}
      >
        <SecondaryButton>New contest</SecondaryButton>
      </form>
      <form
        action={async () => {
          'use server'
          await db.transaction(async (t) => {
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
          })
        }}
      >
        <PrimaryButton>Seed data</PrimaryButton>
      </form>
    </>
  )
}
