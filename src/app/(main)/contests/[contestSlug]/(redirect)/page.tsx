import { HintSignInSection } from '@/app/_shared/HintSection'
import { DEFAULT_DISCIPLINE, isDiscipline } from '@/app/_types'
import { assertUnreachable } from '@/app/_utils/assert-unreachable'
import { getContestUserCapabilities } from '@/server/internal/get-contest-user-capabilities'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
import { notFound, redirect, RedirectType } from 'next/navigation'

export default async function ContestPage(props: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await props.params
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline
  if (!isDiscipline(discipline))
    redirect(
      `/contests/${contestSlug}?discipline=${DEFAULT_DISCIPLINE}`,
      RedirectType.replace,
    )

  const userCapabilities = await getContestUserCapabilities({
    contestSlug,
    discipline,
  })

  switch (userCapabilities) {
    case 'CONTEST_NOT_FOUND':
      notFound()
    case 'VIEW_RESULTS':
      redirect(
        `/contests/${contestSlug}/results?discipline=${discipline}`,
        RedirectType.replace,
      )
    case 'UNAUTHORIZED':
      return (
        <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
          <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />
        </section>
      )
    case 'SOLVE':
      redirect(
        `/contests/${contestSlug}/solve?discipline=${discipline}`,
        RedirectType.replace,
      )
    default:
      assertUnreachable(userCapabilities)
  }
}
