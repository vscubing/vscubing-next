'use client'

import { HoverPopover, WcaLogoIcon } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { z } from 'zod'

export function WcaBadgeLink({ wcaId }: { wcaId: string }) {
  return (
    <HoverPopover content={<WcaPopoverContent wcaId={wcaId} />} asChild>
      <div>
        <WcaLogoIcon className='hidden text-xs touch:block' />
        <Link
          href={`https://worldcubeassociation.org/persons/${wcaId}`}
          target='_blank'
          className='touch:hidden'
        >
          <WcaLogoIcon className='w-5' />
        </Link>
      </div>
    </HoverPopover>
  )
}

function WcaPopoverContent({ wcaId }: { wcaId: string }) {
  const {
    data: officialData,
    isLoading: isOfficialDataLoading,
    error: officialError,
  } = useWcaUnofficialApi({
    wcaId,
  })
  const {
    data: avatarUrl,
    isLoading: isAvatarLoading,
    error: unofficialError,
  } = useWcaAvatarUrl({
    wcaId,
  })

  if (isOfficialDataLoading || isAvatarLoading)
    return <LoadingDots className='p-4' />
  if (officialError || unofficialError) {
    return (
      <>
        <p>Error:</p>
        <p>{officialError?.message}</p> <p>{unofficialError?.message}</p>
      </>
    )
  }
  if (!officialData) return 'Error'

  const best3by3Results = getBest3by3Results(officialData)
  return (
    <div className='flex gap-[0.625rem] p-3 sm:flex-col sm:items-center'>
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className='max-h-44 grow basis-0 rounded-xl'
          src={avatarUrl}
          alt={officialData.name}
        />
      )}

      <div className='flex flex-col text-left sm:items-center sm:text-center'>
        <div className='border-b border-grey-100 pb-1'>
          <h1 className='title-h3 mb-1 flex items-center gap-2'>
            <CountryFlag iso={officialData.country} />
            <span>{officialData.name}</span>
          </h1>
          <Link
            href={`https://worldcubeassociation.org/persons/${wcaId}`}
            className='btn-sm text-secondary-20'
            target='_blank'
          >
            <span>{wcaId}</span>
          </Link>
        </div>

        <div className='flex flex-1 flex-col justify-end gap-1 pt-4 text-grey-40 sm:pt-2'>
          <p>
            Competitions:{' '}
            <span className='text-white-100'>
              {officialData.numberOfCompetitions}
            </span>
          </p>
          <p>
            Completed solves:{' '}
            <span className='text-white-100'>
              {getTotalCompletedSolveNumber(officialData)}
            </span>
          </p>
          {best3by3Results.single && (
            <p>
              Best 3x3 single:{' '}
              <span className='text-white-100'>
                {formatSolveTime(best3by3Results.single, true)}
              </span>
            </p>
          )}
          {best3by3Results.average && (
            <p>
              Best 3x3 average:{' '}
              <span className='text-white-100'>
                {formatSolveTime(best3by3Results.average, true)}
              </span>
            </p>
          )}
        </div>
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

function useWcaAvatarUrl({ wcaId }: { wcaId: string }) {
  return useQuery({
    queryFn: async () => {
      const res = await fetch(
        `https://www.worldcubeassociation.org/api/v0/persons/${wcaId}`,
      )
      const json = (await res.json()) as unknown
      const parsed = z
        .object({
          person: z.object({ avatar: z.object({ url: z.string().url() }) }),
        })
        .parse(json)

      const avatarUrl = parsed.person.avatar.url
      return avatarUrl.includes('missing_avatar_thumb') ? null : avatarUrl
    },
    queryKey: ['wca-official-api', 'persons', wcaId],
  })
}

const wcaUnofficialRankSchema = z.object({
  eventId: z.string(),
  best: z.number(),
})

const wcaUnofficialUserSchema = z.object({
  name: z.string(),
  country: z.string(),
  numberOfCompetitions: z.number(),
  rank: z.object({
    singles: z.array(wcaUnofficialRankSchema),
    averages: z.array(wcaUnofficialRankSchema),
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
