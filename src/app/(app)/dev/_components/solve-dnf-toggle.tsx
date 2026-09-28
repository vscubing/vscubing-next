'use client'

import { Input, PrimaryButton, SecondaryButton, toast } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import { useTRPC } from '@/lib/trpc/react'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function SolveDnfToggle() {
  const [solveId, setSolveId] = useState('')
  const [lookupId, setLookupId] = useState<number | null>(null)

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const solveQuery = trpc.admin.getSolveById.queryOptions(
    { solveId: lookupId! },
    { enabled: lookupId !== null },
  )
  const { data: solve, isFetching, error } = useQuery(solveQuery)

  const { mutateAsync: setSolveDnf, isPending } = useMutation(
    trpc.admin.setSolveDnf.mutationOptions(),
  )

  async function handleLookup() {
    const id = Number(solveId)
    if (!Number.isInteger(id)) return
    setLookupId(id)
  }

  async function handleToggle() {
    if (!solve) return
    const { error: mutationError } = await tryCatchTRPC(
      setSolveDnf({ solveId: solve.solveId, isDnf: !solve.isDnf }),
    )
    if (mutationError) {
      toast({ title: 'Failed', description: mutationError.message })
      return
    }
    await queryClient.invalidateQueries({ queryKey: solveQuery.queryKey })
  }

  return (
    <section className='space-y-4'>
      <h2 className='title-h2'>DNF a solve</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleLookup()
        }}
        className='flex max-w-[24rem] gap-2'
      >
        <Input
          placeholder='Solve id'
          value={solveId}
          onChange={(e) => setSolveId(e.target.value)}
          required
        />
        <SecondaryButton size='sm' type='submit'>
          Look up
        </SecondaryButton>
      </form>

      {isFetching ? (
        <LoadingDots />
      ) : error ? (
        <p className='text-red-80'>{error.message}</p>
      ) : solve ? (
        <div className='flex items-center gap-3'>
          <span>
            #{solve.solveId} · {solve.username ?? 'Unknown'} ·{' '}
            {solve.discipline} · #{solve.contestSlug} ·{' '}
            {solve.isDnf ? (
              <span className='text-red-80'>DNF</span>
            ) : solve.timeMs != null ? (
              formatSolveTime(solve.timeMs)
            ) : (
              '-'
            )}
          </span>
          <PrimaryButton
            size='sm'
            disabled={isPending}
            onClick={() => void handleToggle()}
          >
            {solve.isDnf ? 'Un-DNF' : 'DNF'}
          </PrimaryButton>
        </div>
      ) : null}
    </section>
  )
}
