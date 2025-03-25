import { formatContestDuration } from "@/app/_utils/formatDate";
import { SecondaryButton, ArrowRightIcon } from "@/app/_components/ui";
import { DEFAULT_DISCIPLINE } from "@/app/_types";
import type { contestsTable } from "@/server/db/schema";
import Link from "next/link";

type ContestProps = {
  contest: Pick<
    typeof contestsTable.$inferSelect,
    "startDate" | "endDate" | "slug"
  >;
};
export function Contest({ contest }: ContestProps) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-8 rounded-xl bg-grey-100 pl-4">
      <div className="sm:space-y-2">
        <p className="title-h3">Contest {contest.slug}</p>
        <p className="text-grey-40">
          {formatContestDuration({
            startDate: contest.startDate,
            endDate: contest.endDate!,
          })}
        </p>
      </div>
      <SecondaryButton size="iconLg" asChild className="sm:h-16 sm:w-16">
        <Link
          href={{
            pathname: `/contests/${contest.slug}`,
            query: { discipline: DEFAULT_DISCIPLINE },
          }}
        >
          <ArrowRightIcon />
        </Link>
      </SecondaryButton>
    </div>
  );
}

export function ContestSkeleton({ height }: { height?: number }) {
  return (
    <div
      className="min-h-16 animate-pulse rounded-xl bg-grey-100"
      style={{ height }}
    ></div>
  );
}
