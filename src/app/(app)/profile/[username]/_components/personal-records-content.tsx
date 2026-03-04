'use client'

import { DisciplineIcon } from '@/frontend/ui'
import { PlaceLabel } from '@/frontend/shared/place-label'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import type { Discipline } from '@/types'
import type { RouterOutputs } from '@/lib/trpc/react'
import Link from 'next/link'

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  '2by2': '2x2',
  '3by3': '3x3',
  '4by4': '4x4',
}

type PersonalRecords = RouterOutputs['profile']['getPersonalRecords']

export function PersonalRecordsContent({
  records,
}: {
  records: PersonalRecords
}) {
  return (
    <>
      <DesktopTable records={records} />
      <MobileCards records={records} />
    </>
  )
}

const COL_CLASSES =
  'grid grid-cols-[1.2fr_0.8fr_1fr_1fr_0.8fr] items-center gap-x-2 px-4 py-2.5'

function DesktopTable({ records }: { records: PersonalRecords }) {
  return (
    <div className='sm:hidden'>
      <div className='border-grey-100 divide-grey-100 divide-y rounded-xl border'>
        <div className={`text-grey-40 ${COL_CLASSES} text-sm`}>
          <span>Discipline</span>
          <span className='text-center'>Rank Single</span>
          <span className='text-center'>Single Time</span>
          <span className='text-center'>Average Time</span>
          <span className='text-center'>Rank Average</span>
        </div>
        {records.map((record) => (
          <div key={record.discipline} className={COL_CLASSES}>
            <span className='flex items-center gap-2'>
              <DisciplineIcon discipline={record.discipline} />
              <span className='text-base'>
                {DISCIPLINE_LABELS[record.discipline]}
              </span>
            </span>
            <span className='flex justify-center'>
              {record.single ? (
                <PlaceLabel podiumColors size='sm'>
                  {record.single.rank}
                </PlaceLabel>
              ) : (
                <span className='text-grey-40'>--</span>
              )}
            </span>
            <span className='text-center'>
              {record.single ? (
                <Link
                  href={`/contests/${record.single.contestSlug}/watch/${record.single.solveId}?discipline=${record.discipline}`}
                  className='text-white-100 hover:underline'
                >
                  {formatSolveTime(record.single.timeMs, true)}
                </Link>
              ) : (
                <span className='text-grey-40'>--</span>
              )}
            </span>
            <span className='text-center'>
              {record.average ? (
                <Link
                  href={`/contests/${record.average.contestSlug}/results?discipline=${record.discipline}&scrollToId=${record.average.sessionId}`}
                  className='text-white-100 hover:underline'
                >
                  {formatSolveTime(record.average.timeMs, true)}
                </Link>
              ) : (
                <span className='text-grey-40'>--</span>
              )}
            </span>
            <span className='flex justify-center'>
              {record.average ? (
                <PlaceLabel podiumColors size='sm'>
                  {record.average.rank}
                </PlaceLabel>
              ) : (
                <span className='text-grey-40'>--</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileCards({ records }: { records: PersonalRecords }) {
  return (
    <div className='hidden flex-col gap-3 sm:flex'>
      {records.map((record) => (
        <div
          key={record.discipline}
          className='border-grey-100 divide-grey-100 divide-y rounded-xl border'
        >
          <div className='flex items-center gap-2 px-4 py-3'>
            <DisciplineIcon discipline={record.discipline} />
            <span className='title-h3 flex-1'>
              {DISCIPLINE_LABELS[record.discipline]}
            </span>
            {record.single && (
              <PlaceLabel podiumColors size='sm'>
                {record.single.rank}
              </PlaceLabel>
            )}
          </div>
          <MobileRecordRow
            label='Rank Single'
            value={
              record.single ? (
                <PlaceLabel podiumColors size='sm'>
                  {record.single.rank}
                </PlaceLabel>
              ) : (
                '--'
              )
            }
          />
          <MobileRecordRow
            label='Single Time'
            value={
              record.single ? (
                <Link
                  href={`/contests/${record.single.contestSlug}/watch/${record.single.solveId}?discipline=${record.discipline}`}
                  className='text-white-100 hover:underline'
                >
                  {formatSolveTime(record.single.timeMs, true)}
                </Link>
              ) : (
                '--'
              )
            }
          />
          <MobileRecordRow
            label='Average Time'
            value={
              record.average ? (
                <Link
                  href={`/contests/${record.average.contestSlug}/results?discipline=${record.discipline}&scrollToId=${record.average.sessionId}`}
                  className='text-white-100 hover:underline'
                >
                  {formatSolveTime(record.average.timeMs, true)}
                </Link>
              ) : (
                '--'
              )
            }
          />
          <MobileRecordRow
            label='Rank Average'
            value={
              record.average ? (
                <PlaceLabel podiumColors size='sm'>
                  {record.average.rank}
                </PlaceLabel>
              ) : (
                '--'
              )
            }
          />
        </div>
      ))}
    </div>
  )
}

function MobileRecordRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className='flex items-center justify-between px-4 py-2.5'>
      <span className='text-grey-40 text-sm'>{label}</span>
      <span className='text-white-100 text-base'>
        {typeof value === 'string' ? (
          <span className='text-grey-40'>{value}</span>
        ) : (
          value
        )}
      </span>
    </div>
  )
}
