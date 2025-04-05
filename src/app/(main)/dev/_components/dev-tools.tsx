'use client'

import { toast } from '@/app/_components/ui'
import { useTRPC } from '@/trpc/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function DevTools() {
  const trpc = useTRPC()
  const { data: initialContest } = useQuery(
    trpc.contest.getInitialSystemContest.queryOptions(),
  )
  if (!initialContest)
    toast({
      title: 'Attention, developer!',
      description: (
        <>
          You don&apos;t have an initial system contest. You might want to
          create one in the{' '}
          <Link href='/dev' className='text-secondary-20 underline'>
            developer tools
          </Link>
        </>
      ),
      dedupId: 'no-initial-contest',
      className: 'border-2 border-red-80',
    })

  return null
}
