'use client'

import { useSimulator } from '@/app/(app)/contests/[contestSlug]/solve/_components/simulator'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline, ResultDnfable } from '@/types'
import { signSolve } from '@/lib/utils/solve-signature'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { type Toast, toast } from '../ui'
import { SolveTimeLinkOrDnf } from './solve-time-button'

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
  const [seenDiscordInvite, setSeenDiscordInvite] = useLocalStorage(
    'vs-seenDiscordInvite',
    false,
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
            // TODO: we probably should be revalidating queryKeys and not queries
            trpc.contest.getContestResults.queryOptions({
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
      onSuccess: () => {
        const TOTAL_ROUND_ATTEMPTS = 5
        const justFinishedRound =
          state?.submittedSolves.length === TOTAL_ROUND_ATTEMPTS - 1
        if (justFinishedRound) {
          void router.push(
            `/contests/${contestSlug}/results?discipline=${discipline}&scrollToOwn=true`,
          )
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries(stateQuery)
        void queryClient.invalidateQueries(
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        )
      },
    }),
  )

  const { initSolve } = useSimulator()

  function handleInitSolve() {
    if (!state)
      throw new Error('useSolveForm handler called with undefined state')
    initSolve(
      { discipline, scramble: state.currentScramble.moves },
      (solve) => {
        return postSolveResult({
          solve: signSolve(solve),
          scrambleId: state.currentScramble.id,
          contestSlug,
          discipline,
        })
      },
    )
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

    if (
      state.submittedSolves.length === 4 &&
      payload.type === 'submitted' &&
      !seenDiscordInvite
    ) {
      toast({
        title: 'Great to have you on board',
        description:
          'Join our Discord community to connect with other vscubers',
        contactUsButton: true,
        contactUsButtonLabel: 'Discord',
        duration: 'infinite',
        className: 'w-[23.75rem]',
      })
      setSeenDiscordInvite(true)
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
