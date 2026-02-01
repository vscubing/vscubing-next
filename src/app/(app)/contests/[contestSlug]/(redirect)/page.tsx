import { api } from '@/lib/trpc/server'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { castDiscipline } from '@/types'
import { notFound, redirect, RedirectType } from 'next/navigation'

export default async function ContestPage(props: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await props.params
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline

  const { error } = await tryCatchTRPC(
    api.contest.getContestMetaData({ contestSlug }),
  )

  if (error?.code === 'NOT_FOUND') notFound()
  if (error) throw error

  redirect(
    `/contests/${contestSlug}/results?discipline=${castDiscipline(discipline)}`,
    RedirectType.replace,
  )
}
