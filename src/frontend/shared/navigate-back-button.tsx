'use client'
import { GhostButton, ArrowBackUpIcon } from '@/frontend/ui'
import { cn } from '../utils/cn'
import { useRouter } from 'next/navigation'

export function NavigateBackButton({ className }: { className?: string }) {
  // TODO: add more sophisticated logic with a 'from' search param
  const router = useRouter()
  return (
    <GhostButton
      className={cn(className, 'w-min shrink-0 whitespace-nowrap')}
      size='sm'
      onClick={() => (history.length > 1 ? history.back() : router.push('/'))}
    >
      <ArrowBackUpIcon />
      Go back
    </GhostButton>
  )
}
