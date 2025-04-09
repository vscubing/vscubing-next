'use client'
import { GhostButton, ArrowBackUpIcon } from '@/frontend/ui'
import { cn } from '../utils/cn'

export function NavigateBackButton({ className }: { className?: string }) {
  // TODO: add more sophisticated logic with a 'from' search param
  return (
    <GhostButton
      className={cn(className, 'w-min shrink-0 whitespace-nowrap')}
      size='sm'
      onClick={() => history.back()}
    >
      <ArrowBackUpIcon />
      Go back
    </GhostButton>
  )
}
