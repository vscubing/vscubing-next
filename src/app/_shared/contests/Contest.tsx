// import { formatContestDuration } from "@/app/_utils/formatDate";
// import { SecondaryButton, ArrowRightIcon } from "@/app/_components/ui";
// import { type ContestDTO, DEFAULT_DISCIPLINE } from "@/app/_types";
//
// type ContestProps = { contest: ContestDTO };
// export function Contest({
//   contest: { slug, startDate, endDate },
// }: ContestProps) {
//   return (
//     <div className="flex min-h-16 items-center justify-between gap-8 rounded-xl bg-grey-100 pl-4">
//       <div className="sm:space-y-2">
//         <p className="title-h3">Contest {slug}</p>
//         <p className="text-grey-40">
//           {formatContestDuration({ startDate, endDate })}
//         </p>
//       </div>
//       <SecondaryButton size="iconLg" asChild className="sm:h-16 sm:w-16">
//         <Link
//           to="/contests/$contestSlug"
//           params={{ contestSlug: slug }}
//           search={{ discipline: DEFAULT_DISCIPLINE }}
//         >
//           <ArrowRightIcon />
//         </Link>
//       </SecondaryButton>
//     </div>
//   );
// }
//
// export function ContestSkeleton({ height }: { height?: number }) {
//   return (
//     <div
//       className="min-h-16 animate-pulse rounded-xl bg-grey-100"
//       style={{ height }}
//     ></div>
//   );
// }
