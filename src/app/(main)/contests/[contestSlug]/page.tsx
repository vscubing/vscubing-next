import { DEFAULT_DISCIPLINE, isDiscipline } from '@/app/_types'
import { assertUnreachable } from '@/app/_utils/assert-unreachable'
import { getContestUserCapabilities } from '@/server/api/routers/contest'
import { auth } from '@/server/auth'
import { notFound, redirect } from 'next/navigation'

export default async function ContestPage(props: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await props.params
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline
  if (!isDiscipline(discipline))
    redirect(`/contests/${contestSlug}?discipline=${DEFAULT_DISCIPLINE}`)

  const session = await auth()
  const userCapabilities = await getContestUserCapabilities({
    contestSlug,
    discipline,
    userId: session?.user.id,
  })

  if (userCapabilities === 'CONTEST_NOT_FOUND') notFound()
  if (userCapabilities === 'VIEW_RESULTS')
    redirect(`/contests/${contestSlug}/results?discipline=${discipline}`)
  if (userCapabilities === 'SOLVE' || userCapabilities === 'UNAUTHORIZED')
    redirect(`/contests/${contestSlug}/solve?discipline=${discipline}`)

  assertUnreachable(userCapabilities)
}
