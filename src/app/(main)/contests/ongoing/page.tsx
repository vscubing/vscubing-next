import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'

export default async function Page() {
  const ongoing = await api.contest.ongoing()
  redirect(`/contests/${ongoing.slug}`)
}
