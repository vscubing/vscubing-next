import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'
import { castDiscipline } from '@/app/_types'

export default async function OngoingContestRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { discipline } = await searchParams
  const ongoing = await api.contest.getOngoing()
  if (!ongoing) throw new Error('no ongoing contest!') // TODO: no ongoing contest "on maintenance" page
  redirect(`/contests/${ongoing.slug}?discipline=${castDiscipline(discipline)}`)
}
