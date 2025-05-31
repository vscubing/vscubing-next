import { redirect } from 'next/navigation'
import { api } from '@/lib/trpc/server'
import { castDiscipline } from '@/types'

export default async function OngoingContestRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { discipline } = await searchParams
  const ongoing = await api.contest.getOngoing()
  if (!ongoing) throw new Error('no ongoing contest!')
  redirect(`/contests/${ongoing.slug}?discipline=${castDiscipline(discipline)}`)
}
