import { LayoutHeader } from '@/app/_components/layout'
import { HintSignInSection } from '@/app/_shared/HintSection'
import { DEFAULT_DISCIPLINE, isDiscipline } from '@/app/_types'
import { assertUnreachable } from '@/app/_utils/assert-unreachable'
import { getContestUserCapabilities } from '@/server/api/routers/contest'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
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

  const userCapabilities = await getContestUserCapabilities({
    contestSlug,
    discipline,
  })

  if (userCapabilities === 'CONTEST_NOT_FOUND') notFound()
  if (userCapabilities === 'VIEW_RESULTS')
    redirect(`/contests/${contestSlug}/results?discipline=${discipline}`)
  if (userCapabilities === 'UNAUTHORIZED')
    return (
      <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
        <LayoutHeader />
        <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />
      </section>
    )
  if (userCapabilities === 'SOLVE')
    redirect(`/contests/${contestSlug}/solve?discipline=${discipline}`)

  assertUnreachable(userCapabilities)
}
