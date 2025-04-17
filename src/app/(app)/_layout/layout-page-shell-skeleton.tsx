import { LoadingSpinner } from '@/frontend/ui'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutSectionHeader } from './layout-section-header'
import { LayoutPageTitleMobileFallback } from '@/app/(app)/_layout/layout-page-title-mobile'

export function LayoutPageShellSkeleton({
  spinner = false,
}: {
  spinner?: boolean
}) {
  return (
    <>
      <LayoutPageTitleMobileFallback />
      <NavigateBackButton className='self-start' />
      <LayoutSectionHeader> </LayoutSectionHeader>

      <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80'>
        {spinner && <LoadingSpinner size='lg' />}
      </div>
    </>
  )
}
