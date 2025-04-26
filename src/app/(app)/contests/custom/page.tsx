import { LayoutHeaderTitlePortal } from '../../_layout'
import { LayoutPageTitleMobile } from '../../_layout/layout-page-title-mobile'
import { PrimaryButton } from '@/frontend/ui'
import CreateCustomContestDialog from './components/create-custom-contest-dialog'

export default function CustomContestsPage() {
  return (
    <>
      <LayoutHeaderTitlePortal>Custom contests</LayoutHeaderTitlePortal>
      <LayoutPageTitleMobile>Custom contests</LayoutPageTitleMobile>
      <CreateCustomContestDialog>
        <PrimaryButton className='self-start'>New contest</PrimaryButton>
      </CreateCustomContestDialog>
    </>
  )
}
