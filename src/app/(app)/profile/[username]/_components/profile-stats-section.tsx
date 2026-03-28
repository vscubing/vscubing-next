import { api } from '@/lib/trpc/server'
import { formatDate } from '@/lib/utils/format-date'
import { CalendarIcon, FlameIcon, FlagIcon } from '@/frontend/ui/icons'

export async function ProfileStatsSection({
  userId,
  createdAt,
}: {
  userId: string
  createdAt: string
}) {
  const stats = await api.profile.getProfileStats({ userId, createdAt })

  return (
    <div className='flex gap-6 sm:gap-3'>
      <div className='flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2'>
        <div className='bg-grey-100 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          <CalendarIcon className='text-grey-40' />
        </div>
        <div>
          <p className='text-white-100 mb-0.5 leading-tight'>
            {formatDate(stats.createdAt, 'long')}
          </p>
          <p className='text-grey-40 caption'>Member since</p>
        </div>
      </div>
      <div className='flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2'>
        <div className='bg-grey-100 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          <FlameIcon className='text-podium-bronze' />
        </div>
        <div>
          <p className='text-white-100 mb-0.5 leading-tight'>
            {stats.currentContestStreak}{' '}
            {stats.currentContestStreak === 1 ? 'contest' : 'contests'}
          </p>
          <p className='text-grey-40 caption'>Current Streak</p>
        </div>
      </div>
      <div className='flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2'>
        <div className='bg-grey-100 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          <FlagIcon className='text-grey-40' />
        </div>
        <div>
          <p className='text-white-100 mb-0.5 leading-tight'>
            {stats.contestsParticipated}
          </p>
          <p className='text-grey-40 caption'>Contests</p>
        </div>
      </div>
    </div>
  )
}

export function ProfileStatsFallback() {
  return (
    <div className='flex gap-6 sm:gap-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2'
        >
          <div className='bg-grey-100 h-10 w-10 shrink-0 animate-pulse rounded-lg' />
          <div>
            <div className='bg-grey-100 mb-1 h-4 w-20 animate-pulse rounded' />
            <div className='bg-grey-100 h-3 w-16 animate-pulse rounded' />
          </div>
        </div>
      ))}
    </div>
  )
}
