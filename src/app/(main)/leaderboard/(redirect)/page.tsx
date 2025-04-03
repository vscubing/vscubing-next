import { DEFAULT_DISCIPLINE } from '@/app/_types'
import { redirect } from 'next/navigation'

export default function Page() {
  redirect(`/leaderboard/${DEFAULT_DISCIPLINE}?type=single`)
}
