import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'

export default function Loading() {
  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <div className='h-full rounded-2xl bg-black-80 p-6 sm:p-3'>
        <ul className='space-y-2'>
          <li className='h-20 animate-pulse rounded-xl bg-grey-100'></li>
          <li className='h-20 animate-pulse rounded-xl bg-grey-100'></li>
        </ul>
      </div>
    </>
  )
}
