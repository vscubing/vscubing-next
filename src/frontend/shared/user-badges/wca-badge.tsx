'use client'

import { HoverPopover, WcaLogoIcon } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { useTRPC } from '@/trpc/react'
import { formatSolveTime } from '@/utils/format-solve-time'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { z } from 'zod'

export function WcaBadgeLink({ wcaId }: { wcaId: string }) {
  const trpc = useTRPC()
  const { data: isAdmin } = useQuery(trpc.admin.authorized.queryOptions())
  if (!isAdmin)
    return (
      <Link
        href={`https://worldcubeassociation.org/persons/${wcaId}`}
        className='touch:hidden'
      >
        <WcaLogoIcon className='text-xs' />
      </Link>
    )

  return (
    <HoverPopover
      content={<WcaPopoverContent wcaId={wcaId} />}
      contentProps={{
        className:
          'border-2 border-b-yellow-100 border-t-grey-100 border-x-grey-100',
      }}
      asChild
    >
      <div>
        <WcaLogoIcon className='hidden text-xs touch:block' />
        <Link
          href={`https://worldcubeassociation.org/persons/${wcaId}`}
          className='touch:hidden'
        >
          <WcaLogoIcon className='text-xs' />
        </Link>
      </div>
    </HoverPopover>
  )
}

function WcaPopoverContent({ wcaId }: { wcaId: string }) {
  const trpc = useTRPC()
  const { data: wcaUser, isLoading: isDataLoading } = useWcaUnofficialApi({
    wcaId,
  })
  const { data: avatarSrc, isLoading: isAvatarLoading } = useQuery(
    trpc.user.wcaAvatar.queryOptions({ wcaId }),
  )

  if (isDataLoading || isAvatarLoading) return <LoadingDots />
  if (!wcaUser) return 'Error'

  const best3by3Results = getBest3by3Results(wcaUser)
  return (
    <div className='flex gap-4 sm:flex-col sm:items-center'>
      {avatarSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className='max-h-48 max-w-48 grow basis-0 rounded-xl'
          src={avatarSrc}
          alt={wcaUser.name}
        />
      )}

      <div className='flex flex-col text-left sm:items-center sm:text-center'>
        <h1 className='btn-lg flex items-center gap-2'>
          <CountryFlag iso={wcaUser.country} />
          <span>{wcaUser.name}</span>
        </h1>
        <div className='flex items-center gap-2'>
          <Link
            href={`https://worldcubeassociation.org/persons/${wcaId}`}
            className='text-secondary-20 underline'
          >
            <span>({wcaId})</span>
          </Link>
        </div>
        <p>Competitions: {wcaUser.numberOfCompetitions}</p>
        <p>Completed solves: {getTotalCompletedSolveNumber(wcaUser)}</p>
        {best3by3Results.single && (
          <p>
            Best 3x3 single: {formatSolveTime(best3by3Results.single, true)}
          </p>
        )}
        {best3by3Results.average && (
          <p>
            Best 3x3 average: {formatSolveTime(best3by3Results.average, true)}
          </p>
        )}
      </div>
    </div>
  )
}

function useWcaUnofficialApi({ wcaId }: { wcaId: string }) {
  return useQuery({
    queryFn: async () => {
      const res = await fetch(
        `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wcaId}.json`,
      )
      const json = (await res.json()) as unknown
      return wcaUnofficialUserSchema.parse(json)
    },
    queryKey: ['wca-unofficial-api', 'persons', wcaId],
  })
}

const rankSchema = z.object({
  eventId: z.string(),
  best: z.number(),
  rank: z.object({
    world: z.number(),
    continent: z.number(),
    country: z.number(),
  }),
})

const wcaUnofficialUserSchema = z.object({
  name: z.string(),
  country: z.string(),
  numberOfCompetitions: z.number(),
  rank: z.object({
    singles: z.array(rankSchema),
    averages: z.array(rankSchema),
  }),
  results: z.record(
    z.string(),
    z.record(z.string(), z.array(z.object({ solves: z.array(z.number()) }))),
  ),
})

function CountryFlag(props: { iso: string }) {
  const iso = props.iso.toLowerCase()
  return (
    <picture>
      <source
        type='image/webp'
        srcSet={`https://flagcdn.com/16x12/${iso}.webp,
      https://flagcdn.com/32x24/${iso}.webp 2x,
      https://flagcdn.com/48x36/${iso}.webp 3x`}
      />
      <source
        type='image/png'
        srcSet={`https://flagcdn.com/16x12/${iso}.png,
      https://flagcdn.com/32x24/${iso}.png 2x,
      https://flagcdn.com/48x36/${iso}.png 3x`}
      />
      <img
        src={`https://flagcdn.com/16x12/${iso}.png`}
        width='16'
        height='12'
        alt={iso}
      />
    </picture>
  )
}

function getTotalCompletedSolveNumber({
  results,
}: z.infer<typeof wcaUnofficialUserSchema>): number {
  const solves = Object.values(results)
    .flatMap((competition) =>
      Object.values(competition).flatMap((discipline) =>
        discipline.flatMap((d) => d.solves),
      ),
    )
    .filter((time) => time > 0)
  return solves.length
}

function getBest3by3Results({
  rank,
}: z.infer<typeof wcaUnofficialUserSchema>): {
  average?: number
  single?: number
} {
  const bestAvg = rank.averages.find(({ eventId }) => eventId === '333')?.best
  const bestSingle = rank.singles.find(({ eventId }) => eventId === '333')?.best
  return {
    average: bestAvg && bestAvg * CENTISECONDS_IN_MS,
    single: bestSingle && bestSingle * CENTISECONDS_IN_MS,
  }
}

const CENTISECONDS_IN_MS = 10
