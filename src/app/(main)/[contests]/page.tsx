import { HydrateClient } from "@/trpc/server";
import { Header, SectionHeader } from "@/app/_components/layout";
import type { ReactNode } from "react";
import {
  DEFAULT_DISCIPLINE,
  isDiscipline,
  type Discipline,
} from "@/app/_types";
import { PageTitleMobile } from "@/app/_shared/PageTitleMobile";
import { NavigateBackButton } from "@/app/_shared/NavigateBackButton";
import Link from "next/link";
import { DISCIPLINES } from "@/shared";
import { CubeSwitcher } from "@/app/_components/ui";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { HintSection } from "@/app/_shared/HintSection";
import { AutofillHeight } from "@/app/_shared/autofillHeight";

import {
  ContestRowSkeleton as ContestSkeletonDesktop,
  ContestRow as ContestDesktop,
} from "./_Contest";
import {
  Contest as ContestMobile,
  ContestSkeleton as ContestSkeletonMobile,
} from "@/app/_shared/contests/Contest";
import { ContestsListHeader } from "./_ContestsListHeader";
import { useMatchesScreen } from "@/app/_utils/tailwind";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function ContestsIndexPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  if (!isDiscipline(searchParams.discipline))
    redirect(`/contests?discipline=${DEFAULT_DISCIPLINE}`);

  return (
    <HydrateClient>
      <View discipline={searchParams.discipline}>
        <ContestsList discipline={searchParams.discipline} />
      </View>
    </HydrateClient>
  );
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

type ViewProps = {
  discipline: Discipline;
  children: ReactNode;
};
function View({ discipline: currentDiscipline, children }: ViewProps) {
  const title = "Explore contests";
  // const { data: availableDisciplines } = useAvailableDisciplines();
  return (
    <section className="flex flex-1 flex-col gap-3 sm:gap-2">
      <Header title={title} />
      <PageTitleMobile>{title}</PageTitleMobile>
      <NavigateBackButton className="self-start" />
      <SectionHeader>
        <div className="flex gap-3">
          {DISCIPLINES.map((discipline) => (
            <Link
              href={{ pathname: "/contests", query: { discipline } }}
              key={discipline}
            >
              <CubeSwitcher
                asButton={false}
                cube={discipline}
                isActive={discipline === currentDiscipline}
              />
            </Link>
          ))}
        </div>
      </SectionHeader>
      {children}
    </section>
  );
}

async function ContestsList({
  discipline,
  // contests,
  // lastElementRef,
}: {
  discipline: Discipline;
  // contests?: (typeof contestsTable)[];
  // lastElementRef?: (node?: Element | null) => void;
}) {
  // const isSmScreen = useMatchesScreen("sm");
  const isSmScreen = false;
  const Contest = isSmScreen ? ContestMobile : ContestDesktop;
  const ContestSkeleton = isSmScreen
    ? ContestSkeletonMobile
    : ContestSkeletonDesktop;

  const contests = await api.contest.getPastContestsByDiscipline({
    discipline,
  });

  if (contests?.length === 0) {
    return (
      <HintSection>
        <p>
          While this page may be empty now, it&apos;s brimming with potential
          for thrilling contests that will soon fill this space.
        </p>
      </HintSection>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3">
      <ContestsListHeader className="sm:hidden" />

      {contests ? (
        <ul className="flex flex-1 flex-col gap-2">
          {contests.map((contest, index) => (
            <li
              key={contest.contest?.id}
              // ref={index === contests.length - 1 ? lastElementRef : undefined}
            >
              <Contest discipline={discipline} contest={contest.contest!} />
            </li>
          ))}
        </ul>
      ) : (
        <AutofillHeight.ListSkeleton
          className="flex flex-1 flex-col gap-2"
          renderSkeletonItem={() => <ContestSkeleton />}
        />
      )}
    </div>
  );
}
