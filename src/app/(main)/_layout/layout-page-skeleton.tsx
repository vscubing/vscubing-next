import { LoadingSpinner } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { title } from 'process'
import { LayoutSectionHeader } from './section-header'

export function LayoutPageShellSkeleton({
  spinner = false,
}: {
  spinner?: boolean
}) {
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <h1 className='title-h2 hidden text-secondary-20 lg:block'>{title}</h1>
      <NavigateBackButton className='self-start' />
      <LayoutSectionHeader> </LayoutSectionHeader>

      <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80'>
        {spinner && <LoadingSpinner size='lg' />}
      </div>
    </section>
  )
}
