import { LayoutHeaderTitlePortal } from '../../_layout'
import { LayoutPageTitleMobile } from '../../_layout/layout-page-title-mobile'
import { PrimaryButton } from '@/frontend/ui'
import { SpecialContestCreationDialog } from './components/create-custom-contest-dialog'
import { api } from '@/trpc/server'
import { ContestRowDesktop } from '../(index)/_components/contest'
import { db } from '@/backend/db'
import { contestTable } from '@/backend/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export default async function CustomContestsPage() {
  const canCreate = await api.specialContest.canManage()
  const specials = await db
    .selectDistinctOn([contestTable.startDate], {
      slug: contestTable.slug,
      startDate: contestTable.startDate,
      expectedEndDate: contestTable.expectedEndDate,
      endDate: contestTable.endDate,
      isOngoing: contestTable.isOngoing,
    })
    .from(contestTable)
    .where(and(eq(contestTable.type, 'special')))
    .orderBy(desc(contestTable.startDate))

  return (
    <div className='flex-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <LayoutHeaderTitlePortal>Special contests</LayoutHeaderTitlePortal>
      <LayoutPageTitleMobile>Special contests</LayoutPageTitleMobile>
      {canCreate && (
        <SpecialContestCreationDialog>
          <PrimaryButton className='mb-2 self-start'>New special</PrimaryButton>
        </SpecialContestCreationDialog>
      )}
      <ul className='space-y-1'>
        {specials.map((contest) => (
          <li key={contest.slug}>
            <ContestRowDesktop contest={contest} />
          </li>
        ))}
      </ul>
    </div>
  )
}
