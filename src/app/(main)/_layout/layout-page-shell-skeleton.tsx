import { LoadingSpinner } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { LayoutSectionHeader } from './layout-section-header'
import { LayoutPageTitleMobileFallback } from '@/app/_shared/layout-page-title-mobile'

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
