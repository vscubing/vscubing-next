import { LayoutHeaderTitlePortal } from '../../_layout'
import { LayoutPageTitleMobile } from '../../_layout/layout-page-title-mobile'
import { PrimaryButton } from '@/frontend/ui'
import { SpecialContestCreationDialog } from './components/create-custom-contest-dialog'

export default function CustomContestsPage() {
  return (
    <>
      <LayoutHeaderTitlePortal>Special contests</LayoutHeaderTitlePortal>
      <LayoutPageTitleMobile>Special contests</LayoutPageTitleMobile>
      <SpecialContestCreationDialog>
        <PrimaryButton className='self-start'>New special</PrimaryButton>
      </SpecialContestCreationDialog>
    </>
  )
}
