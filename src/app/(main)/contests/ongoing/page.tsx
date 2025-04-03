import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'
import { DEFAULT_DISCIPLINE } from '@/app/_types'

export default async function Page() {
  const ongoing = await api.contest.getOngoing()
  redirect(`/contests/${ongoing.slug}?discipline=${DEFAULT_DISCIPLINE}`)
}
