import { DEFAULT_DISCIPLINE, type Discipline } from "@/app/_types";
import { CubeIcon, SecondaryButton } from "@/app/_components/ui";
import type { contestsTable } from "@/server/db/schema";
import { formatContestDuration } from "@/app/_utils/formatDate";
import Link from "next/link";

type ContestProps = {
  contest: Pick<
    typeof contestsTable.$inferSelect,
    "startDate" | "endDate" | "slug"
  >;
  discipline: Discipline;
  height?: number;
};
export function ContestRow({ contest, discipline, height }: ContestProps) {
  return (
    <div
      className="text-large flex h-15 items-center justify-between rounded-xl bg-grey-100 pl-4"
      style={{ height }}
    >
      <CubeIcon cube={discipline} className="mr-4" />
      <span className="vertical-alignment-fix relative mr-4 flex-1 pr-4 after:absolute after:right-0 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60">
        Contest {contest.slug}
      </span>
      <span className="vertical-alignment-fix mr-10 w-44 whitespace-nowrap">
        {formatContestDuration(contest)}
      </span>
      <SecondaryButton asChild className="h-full">
        <Link
          href={{
            pathname: `/contests/${contest.slug}`,
            query: { discipline: DEFAULT_DISCIPLINE },
          }}
        >
          view contest
        </Link>
      </SecondaryButton>
    </div>
  );
}

export function ContestRowSkeleton({ height }: { height?: number }) {
  return (
    <div
      className="h-15 animate-pulse rounded-xl bg-grey-100"
      style={{ height }}
    ></div>
  );
}
