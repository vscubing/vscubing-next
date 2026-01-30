'use client'

import { useSimulator } from '@/app/(app)/contests/[contestSlug]/solve/_components/simulator'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline, ResultDnfable } from '@/types'
import { signSolve } from '@/lib/utils/solve-signature'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type Toast, toast } from '../ui'
import { SolveTimeLinkOrDnf } from './solve-time-button'
import { v4 as uuid } from 'uuid'
import state from 'pusher-js/types/src/core/http/state'

export function useSolveForm({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const router = useRouter()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const metadataQuery = trpc.userMetadata.userMetadata.queryOptions()
  const { data: userMetadata } = useQuery(metadataQuery)
  const { mutate: updateUserMetadata } = useMutation(
    trpc.userMetadata.updateUserMetadata.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(metadataQuery),
    }),
  )

  const stateQuery = trpc.roundSession.state.queryOptions({
    contestSlug,
    discipline,
  })

  const { data: state, isFetching: isStateFetching } = useQuery(stateQuery)

  const { mutate: postSolveResult, isPending: isPostSolvePending } =
    useMutation(
      trpc.roundSession.postSolve.mutationOptions({
        onSuccess: (res) => {
          if (res?.setNewPersonalRecord)
            handlePersonalRecord(res.previousPersonalRecord)
        },
        onSettled: () => {
          void queryClient.invalidateQueries(stateQuery)
          void queryClient.invalidateQueries(
            trpc.contest.getContestResults.queryOptions({
              contestSlug,
              discipline,
            }),
          )
          void queryClient.invalidateQueries(
            trpc.roundSession.canLeaveRound.queryOptions({
              contestSlug,
              discipline,
            }),
          )
        },
        onError: (error) => {
          if (error?.data?.code === 'BAD_REQUEST') toast(SOLVE_REJECTED_TOAST)
        },
      }),
    )
  const { mutate: submitSolve, isPending: isSubmitSolvePending } = useMutation(
    trpc.roundSession.submitSolve.mutationOptions({
      onSuccess: ({ sessionFinished }) => {
        if (sessionFinished)
          void router.push(
            `/contests/${contestSlug}/results?discipline=${discipline}&scrollToOwn=true`,
          )
      },
      onSettled: () => {
        void queryClient.invalidateQueries(stateQuery)
        void queryClient.invalidateQueries(
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(
          trpc.roundSession.canSolve.queryOptions({
            contestSlug,
            discipline,
          }),
        )
      },
    }),
  )

  const { initSolve } = useSimulator()

  const { mutate: registerSolveStream } = useMutation(
    trpc.solveStream.registerSolveStream.mutationOptions(),
  )
  const { mutate: sendMove } = useMutation(
    trpc.solveStream.sendMove.mutationOptions(),
  )
  const { mutate: unregisterSolveStream } = useMutation(
    trpc.solveStream.unregisterSolveStream.mutationOptions(),
  )
  function handleInitSolve() {
    if (!state)
      throw new Error('useSolveForm handler called with undefined state')
    const streamId = uuid()
    initSolve({
      initSolveData: { discipline, scramble: state.currentScramble.moves },
      inspectionStartCallback: () =>
        void registerSolveStream({
          streamId: streamId,
          discipline,
          scramble: state.currentScramble.moves,
        }),
      moveCallback: (move, event) => void sendMove({ streamId, move, event }),
      solveCallback: (solve) => {
        postSolveResult({
          solve: signSolve(solve),
          scrambleId: state.currentScramble.id,
          contestSlug,
          discipline,
        })
        unregisterSolveStream({ streamId })
      },
    })
  }

  async function handleSubmitSolve(
    payload:
      | { type: 'changed_to_extra'; reason: string }
      | { type: 'submitted' },
  ) {
    if (!state)
      throw new Error('useSolveForm handler called with undefined state')

    submitSolve({
      contestSlug,
      discipline,
      type: payload.type,
      solveId: state.currentSolve!.id,
    })

    if (state.submittedSolves.length === 4 && payload.type === 'submitted') {
      handleSessionFinished()
    }
  }

  function handleSessionFinished() {
    if (!userMetadata) return

    if (!userMetadata.seenDiscordInvite) {
      toast({
        title: 'Great to have you on board',
        description:
          'Join our Discord community to connect with other vscubers',
        contactUsButton: true,
        contactUsButtonLabel: 'Discord',
        duration: 'infinite',
        className: 'w-[23.75rem]',
      })
      updateUserMetadata({ seenDiscordInvite: true })
      return
    }
  }

  function handlePersonalRecord(previousPersonalRecord?: {
    id: number
    result: ResultDnfable
    contestSlug: string
  }) {
    toast({
      title: 'Wow, new personal best single!',
      description: previousPersonalRecord ? (
        <>
          Previous personal best:{' '}
          {
            <SolveTimeLinkOrDnf
              className='h-auto min-w-0'
              canShowHint={false}
              result={previousPersonalRecord.result}
              discipline={discipline}
              contestSlug={previousPersonalRecord.contestSlug}
              solveId={previousPersonalRecord.id}
            />
          }
        </>
      ) : (
        'You can check out the reconstruction by clicking on the solve time.'
      ),
      variant: 'festive',
    })
  }

  return {
    isPending: isStateFetching || isPostSolvePending || isSubmitSolvePending,
    handleInitSolve,
    handleSubmitSolve,
    state,
  }
}

const SOLVE_REJECTED_TOAST = {
  title: 'Uh-oh! Solve rejected by the server',
  description:
    "Under normal circumstances this shouldn't happen. Feel free to take an extra.",
  duration: 'infinite',
  contactUsButton: true,
} satisfies Toast
