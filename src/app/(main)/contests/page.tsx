import { HydrateClient } from '@/trpc/server'
import { SecondaryButton } from '@/app/_components/ui'
import { LayoutHeader, SectionHeader } from '@/app/_components/layout'
import { Suspense, type ReactNode } from 'react'
import {
  DEFAULT_DISCIPLINE,
  DISCIPLINES,
  isDiscipline,
  type Discipline,
} from '@/app/_types'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'
import { HintSection } from '@/app/_shared/HintSection'
import {
  ContestRowSkeletonDesktop,
  ContestRowSkeletonMobile,
} from './_components/contest'
import { DisciplineSwitcher } from '../../_shared/discipline-switcher-client'
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
    <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
      <LayoutHeader title={title} />
      <PageTitleMobile>{title}</PageTitleMobile>
      <NavigateBackButton className='self-start' />
      <SectionHeader>
        <DisciplineSwitcher
          disciplines={DISCIPLINES}
          initialDiscipline={discipline}
        />
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
  )
}

async function PageContent({ discipline }: { discipline: Discipline }) {
  const contests = await api.contest.getPastContests({
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
      <HydrateClient>
        <ContestList initialData={contests} discipline={discipline} />
      </HydrateClient>
    </ContestListWrapper>
  )
}

function ContestListWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <div className='flex justify-between bg-black-80 pl-3 text-grey-40 sm:hidden'>
        <span className='mr-3'>Type</span>
        <span className='mr-8 flex-1'>Contest name</span>
        <span className='mr-10 w-44'>Duration</span>
        <SecondaryButton aria-hidden className='invisible h-px'>
          view contest
        </SecondaryButton>
      </div>

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
