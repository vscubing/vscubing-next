import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'

export default async function Page() {
  const ongoing = await api.contest.getOngoing()
  redirect(`/contests/${ongoing.slug}`)
}
