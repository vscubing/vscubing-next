'use client'
import { GhostButton, ArrowBackUpIcon } from '@/app/_components/ui'
import { cn } from '../_utils/cn'

export function NavigateBackButton({ className }: { className?: string }) {
  // TODO: add more sophisticated logic with a 'from' search param
  return (
    <GhostButton
      className={cn(className, 'shrink-0')}
      size='sm'
      onClick={() => history.back()}
    >
      <ArrowBackUpIcon />
      Go back
    </GhostButton>
  )
}
