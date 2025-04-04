'use client'

import { toast } from '@/app/_components/ui'
import { useTRPC } from '@/trpc/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function DevTools() {
  const trpc = useTRPC()
  const { data: initialContest, isLoading } = useQuery(
    trpc.contest.getInitialSystemContest.queryOptions(),
  )
  const { data: ongoingContest } = useQuery(
    trpc.contest.getOngoing.queryOptions(),
  )

  if (!isLoading && !initialContest)
    alertToast(
      <>
        You don&apos;t have an initial system contest. You might want to create
        one in the{' '}
        <Link href='/dev' className='text-secondary-20 underline'>
          developer tools
        </Link>
      </>,
    )
  else if (ongoingContest === null)
    alertToast(
      <>
        There is no real (non-system) ongoing contest You might want to create
        one in the{' '}
        <Link href='/dev' className='text-secondary-20 underline'>
          developer tools
        </Link>{' '}
      </>,
    )
  return null
}

function alertToast(message: ReactNode) {
  toast({
    title: 'Attention, developer!',
    description: message,
    dedupId: 'attention-developer',
    className: 'border-2 border-red-80',
  })
}
