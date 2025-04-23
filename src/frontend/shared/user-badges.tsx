'use client'

import Link from 'next/link'
import {
  AverageIcon,
  CodeXmlIcon,
  DisciplineIcon,
  HoverPopover,
  SingleIcon,
  SquareArrowOutUpRight,
  TrophyIcon,
  WcaLogoIcon,
} from '../ui'
import type { UserGlobalRecords } from '@/backend/shared/global-record'
import { SolveTimeLabel, SolveTimeLinkOrDnf } from './solve-time-button'
import type { User } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useTRPC } from '@/trpc/react'
import { formatSolveTime } from '@/utils/format-solve-time'
import { LoadingDots } from '../ui/loading-dots'

export function UserBadges({ user }: { user: User }) {
  return (
    <span className='flex items-center gap-2'>
      {user.role === 'admin' && <DeveloperBadge />}
      {user.globalRecords && (
        <RecordHolderBadge records={user.globalRecords} name={user.name} />
      )}
      {user.wcaId && <WcaBadgeLink wcaId={user.wcaId} />}
    </span>
  )
}

function WcaBadgeLink({ wcaId }: { wcaId: string }) {
  return (
    <HoverPopover
      content={<WcaPopoverContent wcaId={wcaId} />}
      contentProps={{
        className:
          'border-2 border-b-yellow-100 border-t-grey-100 border-x-grey-100',
      }}
      asChild
    >
      <Link href={`https://worldcubeassociation.org/persons/${wcaId}`}>
        <WcaLogoIcon className='text-xs' />
      </Link>
    </HoverPopover>
  )
}

function WcaPopoverContent({ wcaId }: { wcaId: string }) {
  const trpc = useTRPC()
  const { data: officialData } = useQuery(
    trpc.user.wcaUserData.queryOptions({ wcaId }),
  )
  const { data: unofficialData } = useWcaUnofficialApi({ wcaId })
  if (!officialData || !unofficialData) return <LoadingDots />

  const best3by3Results = getBest3by3Results(unofficialData)
  const hasAvatar = officialData.avatar.id !== null
  return (
    <div className='flex gap-4 sm:flex-col sm:items-center'>
      {hasAvatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className='max-h-48 max-w-48 grow basis-0 rounded-xl'
          src={officialData.avatar.url}
          alt={officialData.name}
        />
      )}

      <div className='flex flex-col text-left sm:items-center sm:text-center'>
        <h1 className='btn-lg flex items-center gap-2'>
          <Flag iso={officialData.country.iso2} />
          <span>{officialData.name}</span>
        </h1>
        <div className='flex items-center gap-2'>
          <Link
            href={`https://worldcubeassociation.org/persons/${wcaId}`}
            className='text-secondary-20 underline'
          >
            <span>({wcaId})</span>
          </Link>
        </div>
        <p>Competitions: {unofficialData.numberOfCompetitions}</p>
        <p>Completed solves: {getTotalCompletedSolveNumber(unofficialData)}</p>
        {best3by3Results.single && (
          <p>Best 3x3 single: {formatSolveTime(best3by3Results.single)}</p>
        )}
        {best3by3Results.average && (
          <p>Best 3x3 average: {formatSolveTime(best3by3Results.average)}</p>
        )}
      </div>
    </div>
  )
}

function RecordHolderBadge({
  records,
  name,
}: {
  records: UserGlobalRecords
  name: string
}) {
  return (
    <HoverPopover
      content={<RecordHolderPopover records={records} name={name} />}
      contentProps={{
        className:
          'border-2 border-b-amber-400 border-t-grey-100 border-x-grey-100',
      }}
      asChild
    >
      <span className='relative inline-flex text-amber-400'>
        <TrophyIcon className='text-sm' />
      </span>
    </HoverPopover>
  )
}

function RecordHolderPopover({
  records,
  name,
}: {
  records: UserGlobalRecords
  name: string
}) {
  const recordCount = records.averages.length + records.singles.length
  return (
    <>
      <p className='flex items-center gap-1'>
        <TrophyIcon className='-mt-1' />
        <span>
          {name} holds {recordCount} {recordCount > 1 ? 'records' : 'record'}
        </span>
      </p>
      {records.averages.map(({ contestSlug, discipline, roundSession }) => (
        <div key={roundSession.id} className='flex items-center'>
          <DisciplineIcon discipline={discipline} className='mr-3' />
          <span className='-mr-2 flex w-20 items-center gap-1 text-secondary-20'>
            <AverageIcon className='text-sm' />
            <span className='vertical-alignment-fix'>Average</span>
          </span>
          <SolveTimeLabel
            timeMs={roundSession.result.timeMs ?? undefined}
            isAverage
            className='mr-2'
          />
          <Link
            href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSession.id}`}
            className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
          >
            Contest {contestSlug}
            <SquareArrowOutUpRight width='1em' height='1em' />
          </Link>
        </div>
      ))}

      {records.singles.map(({ contestSlug, discipline, solve }) => (
        <div key={solve.id} className='flex items-center'>
          <DisciplineIcon discipline={discipline} className='mr-3' />
          <span className='-mr-2 flex w-20 items-center gap-1 text-secondary-20'>
            <SingleIcon className='text-sm' />
            <span className='vertical-alignment-fix'>Single</span>
          </span>
          <SolveTimeLinkOrDnf
            result={solve.result}
            solveId={solve.id}
            contestSlug={contestSlug}
            discipline={discipline}
            canShowHint={false}
            className='mr-2'
          />
          <Link
            href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${solve.roundSessionId}`}
            className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
          >
            Contest {contestSlug}
            <SquareArrowOutUpRight width='1em' height='1em' />
          </Link>
        </div>
      ))}
    </>
  )
}

function DeveloperBadge() {
  return (
    <HoverPopover
      content='vscubing developer'
      contentProps={{ className: 'border-b-2 border-primary-100' }}
      asChild
    >
      <span className='inline-flex h-5 w-5 items-center justify-center gap-0.5 rounded-md text-xs font-semibold text-primary-60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'>
        <CodeXmlIcon />
      </span>
    </HoverPopover>
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
    queryKey: ['wca-user-data', wcaId],
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

function Flag(props: { iso: string }) {
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
        alt='Ukraine'
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
    average: bestAvg && bestAvg * 10,
    single: bestSingle && bestSingle * 10,
  }
}
