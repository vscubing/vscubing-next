type NavbarProps = {
  onItemSelect?: () => void;
  variant: "vertical" | "horizontal";
};

const ACTIVE_CLASSES_VERTICAL =
  "text-primary-80 after:h-[1.5px] after:scale-x-100 hover:text-primary-80";
const ACTIVE_CLASSES_HORIZONTAL = "text-primary-80 hover:text-primary-80";

export function Navbar({ onItemSelect, variant }: NavbarProps) {
  return "";
  // const navbarLinks = useNavbar();
  //
  // if (variant === "vertical") {
  //   return (
  //     <nav className="flex flex-col gap-4 sm:gap-0">
  //       {navbarLinks.map(({ children, customActiveCondition, ...props }) => (
  //         <Link
  //           {...props}
  //           href={props.to}
  //           activeProps={{
  //             className: cn({
  //               [ACTIVE_CLASSES_VERTICAL]: customActiveCondition === undefined,
  //             }),
  //           }}
  //           onClick={onItemSelect}
  //           className={cn(
  //             "title-h3 after-border-bottom transition-base outline-ring flex items-center gap-4 px-4 py-2 text-grey-20 after:origin-[0%_50%] after:bg-primary-80 hover:text-primary-60 active:text-primary-80 sm:gap-3 sm:p-3",
  //             { [ACTIVE_CLASSES_VERTICAL]: customActiveCondition },
  //           )}
  //         >
  //           {children}
  //         </Link>
  //       ))}
  //     </nav>
  //   );
  // }
  //
  // if (variant === "horizontal") {
  //   return (
  //     <nav className="flex justify-between gap-2 overflow-y-auto px-1 py-2">
  //       {navbarLinks.map(({ children, customActiveCondition, ...props }) => (
  //         <Link
  //           {...props}
  //           key={props.to}
  //           onClick={onItemSelect}
  //           activeProps={{
  //             className: cn({
  //               [ACTIVE_CLASSES_HORIZONTAL]:
  //                 customActiveCondition === undefined,
  //             }),
  //           }}
  //           className={cn(
  //             "caption-sm transition-base flex min-w-[4.625rem] flex-col items-center gap-1 whitespace-nowrap px-1 text-grey-20 active:text-primary-80",
  //             { [ACTIVE_CLASSES_HORIZONTAL]: customActiveCondition },
  //           )}
  //         >
  //           {children}
  //         </Link>
  //       ))}
  //     </nav>
  //   );
  // }
}

// function useNavbar() {
//   const { data: ongoing } = useOngoingContest();
//   const matchRoute = useMatchRoute();
//
//   const isOnContests = !!matchRoute({
//     to: "/contests",
//     fuzzy: true,
//   });
//   const isOnOngoingContest =
//     !!matchRoute({
//       to: "/contests/$contestSlug",
//       fuzzy: true,
//       params: { contestSlug: ongoing?.data?.slug },
//     }) || !!matchRoute({ to: "/contests/ongoing" });
//
//   let customActive: "all-contests" | "ongoing-contest" | undefined = undefined;
//   if (isOnOngoingContest) {
//     customActive = "ongoing-contest";
//   } else if (isOnContests) {
//     customActive = "all-contests";
//   }
//
//   return getLinks(customActive);
// }
//
// function getLinks(
//   patchedActive?: "all-contests" | "ongoing-contest",
// ): (LinkProps & { children: ReactNode } & {
//   customActiveCondition?: boolean;
// })[] {
//   return [
//     {
//       children: (
//         <>
//           <DashboardIcon />
//           <span>Dashboard</span>
//         </>
//       ),
//       to: "/",
//     },
//     {
//       children: (
//         <>
//           <LeaderboardIcon />
//           <span>Leaderboard</span>
//         </>
//       ),
//       to: "/leaderboard",
//     },
//     {
//       children: (
//         <>
//           <AllContestsIcon />
//           <span>Past contests</span>
//         </>
//       ),
//       to: "/contests",
//       search: { discipline: DEFAULT_DISCIPLINE, page: 1 },
//       activeOptions: {
//         includeSearch: false,
//       },
//       customActiveCondition: patchedActive === "all-contests",
//     },
//     {
//       children: (
//         <>
//           <OngoingContestIcon />
//           <span>Ongoing contest</span>
//         </>
//       ),
//       to: `/contests/ongoing`,
//       customActiveCondition: patchedActive === "ongoing-contest",
//     },
//   ];
// }
