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
  ContestRowDesktop,
  ContestRowMobile,
  ContestRowSkeletonDesktop,
  ContestRowSkeletonMobile,
} from './_components/contest'
import { AutofillHeightListSkeleton } from '@/app/_shared/autofillHeight/ListSkeleton'
import { DisciplineSwitcher } from './_components/discipline-switcher'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
export default async function ContestsIndexPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline

  if (!isDiscipline(discipline))
    redirect(`/contests?discipline=${DEFAULT_DISCIPLINE}`)

  return (
    <HydrateClient>
      <PageShell discipline={discipline}>
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={
            <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
              <ContestsListHeader className='sm:hidden' />
              <AutofillHeightListSkeleton
                className='flex flex-1 flex-col gap-2'
                skeletonItem={
                  <>
                    <ContestRowSkeletonDesktop className='sm:hidden' />
                    <ContestRowSkeletonMobile className='hidden sm:flex' />
                  </>
                }
              />
            </div>
          }
        >
          <PageContent discipline={discipline} />
        </Suspense>
      </PageShell>
    </HydrateClient>
  )
}

// function ContestsIndexPage() {
//   const { discipline } = route.useSearch();
//
//   const query = getInfiniteContestsQuery({
//     pageSize: 20,
//     disciplineSlug: discipline,
//   });
//   const { data, isFetching, isLoading, error, lastElementRef } =
//     AutofillHeight.useInfiniteScroll(query);
//   const isFetchingNotFirstPage = isFetching && !isLoading;
//
//   return (
//     <NotFoundHandler error={error}>
//       <OverlaySpinner isVisible={isFetchingNotFirstPage} />
//       <View discipline={discipline}>
//         <ContestsList
//           contests={data?.pages.flatMap((page) => page.results)}
//           lastElementRef={lastElementRef}
//         />
//       </View>
//     </NotFoundHandler>
//   );
// }

type PageShellProps = {
  discipline: Discipline
  children: ReactNode
}
function PageShell({ children, discipline }: PageShellProps) {
  const title = 'Explore contests'
  return (
    <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
      <Header title={title} />
      <PageTitleMobile>{title}</PageTitleMobile>
      <NavigateBackButton className='self-start' />
      <SectionHeader>
        <DisciplineSwitcher initialDiscipline={discipline} />
      </SectionHeader>
      {children}
    </section>
  )
}

// TODO: [next] add infinite scroll
async function PageContent({ discipline }: { discipline: Discipline }) {
  // lastElementRef?: (node?: Element | null) => void;
  const contests = await api.contest.getPastContestsByDiscipline({
    discipline,
  })

  if (contests?.length === 0) {
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
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <ContestsListHeader className='sm:hidden' />

      <ul className='flex flex-1 flex-col gap-2'>
        {contests.map((contest, index) => (
          <li
            key={contest.contest?.id}
            // ref={index === contests.length - 1 ? lastElementRef : undefined}
            // TODO: [next]
          >
            <ContestRowDesktop
              discipline={discipline}
              contest={contest.contest}
              className='sm:hidden'
            />
            <ContestRowMobile
              contest={contest.contest}
              className='hidden sm:flex'
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
