import { getContestUserCapabilities } from '@/backend/shared/get-contest-user-capabilities'
import { DEFAULT_DISCIPLINE, isDiscipline } from '@/types'
import { assertUnreachable } from '@/lib/utils/assert-unreachable'
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
    case 'SOLVE':
    case 'UNAUTHORIZED':
      redirect(
        `/contests/${contestSlug}/results?discipline=${discipline}`,
        RedirectType.replace,
      )
    default:
      assertUnreachable(userCapabilities)
  }
}
