'use client'

import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { DojoSession } from './_components/dojo-session'

export default function DojoPage() {
  return (
    <>
      <LayoutHeaderTitlePortal>Dojo</LayoutHeaderTitlePortal>
      <ExperimentalBadge className='mb-3 shrink-0 sm:mb-2' />
      <DojoSession discipline='3by3' />
    </>
  )
}
