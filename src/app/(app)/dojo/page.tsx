'use client'

import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { DojoSession } from './_components/dojo-session'

export default function DojoPage() {
  return (
    <>
      <LayoutHeaderTitlePortal>Dojo</LayoutHeaderTitlePortal>
      <div className='flex h-0 flex-1 flex-col gap-3'>
        <ExperimentalBadge className='shrink-0' />
        <div className='min-h-0 flex-1'>
          <DojoSession discipline='3by3' />
        </div>
      </div>
    </>
  )
}
