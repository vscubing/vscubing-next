'use client'

import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { DojoSession } from './_components/dojo-session'
import { useDojoFocusMode } from './_components/dojo-focus-mode-atom'
import { cn } from '@/frontend/utils/cn'

export default function DojoPage() {
  const focusMode = useDojoFocusMode()

  return (
    <>
      <LayoutHeaderTitlePortal>Dojo</LayoutHeaderTitlePortal>
      <ExperimentalBadge
        className={cn(
          'mb-3 shrink-0 transition-opacity duration-300 sm:mb-2',
          focusMode && 'opacity-0',
        )}
      />
      <DojoSession discipline='3by3' />
    </>
  )
}
