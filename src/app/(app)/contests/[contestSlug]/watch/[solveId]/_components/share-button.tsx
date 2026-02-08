'use client'
import { useState } from 'react'
import { SecondaryButton, ShareIcon, toast } from '@/frontend/ui'
import { copyToClipboard } from '@/frontend/utils/copy-to-clipboard'
import { useTRPC } from '@/lib/trpc/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Discipline } from '@/types'

export type ShareSolveReplayData = {
  discipline: Discipline
  scramble: string
  solution: string
  timeMs: number
  username?: string
  date?: number
}

export function ShareSolveButton({
  replayData,
}: {
  replayData?: ShareSolveReplayData
}) {
  const trpc = useTRPC()
  const { data: user } = useQuery(trpc.user.me.queryOptions())
  const [cachedShortId, setCachedShortId] = useState<string | null>(null)

  const createShortLink = useMutation(
    trpc.replayLink.create.mutationOptions({
      onSuccess: ({ id }) => {
        setCachedShortId(id)
        copyShortReplayLink(id)
      },
      onError: () =>
        toast({
          title: 'Uh-oh! An error occured while creating the link',
          description: 'Please try again later.',
        }),
    }),
  )

  const handleClick = () => {
    if (replayData) {
      if (cachedShortId) {
        copyShortReplayLink(cachedShortId)
      } else if (user) {
        createShortLink.mutate(replayData)
      } else {
        copyLongReplayLink()
      }
    } else {
      copyReplayInContestLink()
    }
  }

  return (
    <SecondaryButton
      size='iconSm'
      onClick={handleClick}
      disabled={createShortLink.isPending}
    >
      <ShareIcon />
    </SecondaryButton>
  )
}

function copyShortReplayLink(id: string) {
  const shortUrl = `${window.location.origin}/replay/${id}`
  copyToClipboard(shortUrl).then(
    () =>
      toast({
        title: 'Shortened link copied',
        description: 'You can now share the link with your friends.',
        duration: 'short',
      }),
    () =>
      toast({
        title: 'Uh-oh! An error occured while copying the link',
        description: 'Try changing permissions in your browser settings.',
      }),
  )
}

function copyLongReplayLink() {
  copyToClipboard(window.location.href).then(
    () =>
      toast({
        title: 'Full link copied (sign in to get shortened links)',
        description:
          "You can now share the link, but it's quite long. Sign in to get a shorter link.",
        duration: 'short',
      }),
    () =>
      toast({
        title: 'Uh-oh! An error occured while copying the link',
        description: 'Try changing permissions in your browser settings.',
      }),
  )
}

function copyReplayInContestLink() {
  copyToClipboard(window.location.href).then(
    () =>
      toast({
        title: 'Link copied',
        description: 'You can now share the link with your friends.',
        duration: 'short',
      }),
    () =>
      toast({
        title: 'Uh-oh! An error occured while copying the link',
        description: 'Try changing permissions in your browser settings.',
      }),
  )
}
