import { HydrateClient } from '@/trpc/server'
import { Header, SectionHeader } from '@/app/_components/layout'
import { Suspense, type ReactNode } from 'react'
import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/app/_types'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'
import { HintSection } from '@/app/_shared/HintSection'
import { ContestsListHeader } from './_components/contests-list-header'
import {
  ContestRowSkeletonDesktop,
  ContestRowSkeletonMobile,
} from './_components/contest'
import { DisciplineSwitcher } from './_components/discipline-switcher-client'
import ContestList from './_components/contest-list-client'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
export default async function ContestsIndexPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline

  if (!isDiscipline(discipline))
    redirect(`/contests?discipline=${DEFAULT_DISCIPLINE}`)

  const title = 'Explore contests'
  return (
    <HydrateClient>
      <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
        <Header title={title} />
        <PageTitleMobile>{title}</PageTitleMobile>
        <NavigateBackButton className='self-start' />
        <SectionHeader>
          <DisciplineSwitcher initialDiscipline={discipline} />
        </SectionHeader>
        <Suspense
          key={discipline}
          fallback={
            <ContestListWrapper>
              {Array.from({ length: 20 }).map((_, idx) => (
                <li key={idx}>
                  <ContestRowSkeletonDesktop className='sm:hidden' />
                  <ContestRowSkeletonMobile className='hidden sm:flex' />
                </li>
              ))}
            </ContestListWrapper>
          }
        >
          <PageContent discipline={discipline} />
        </Suspense>
      </section>
    </HydrateClient>
  )
}

// TODO: [next] add infinite scroll
async function PageContent({ discipline }: { discipline: Discipline }) {
  const contests = await api.contest.infinitePastContests({
    discipline,
  })

  if (contests.items?.length === 0) {
    return (
      <HintSection>
        <p>
          While this page may be empty now, it&apos;s brimming with potential
          for thrilling contests that will soon fill this space.
        </p>
      </HintSection>
    )
  }

  return (
    <ContestListWrapper>
      <ContestList discipline={discipline} />
    </ContestListWrapper>
  )
}

function ContestListWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <ContestsListHeader className='sm:hidden' />

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
