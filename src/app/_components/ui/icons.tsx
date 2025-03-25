import Discipline3by3Icon from "@/app/_assets/icons/discipline-3by3.svg";
import Discipline2by2Icon from "@/app/_assets/icons/discipline-2by2.svg";
import AllContestsIcon from "@/app/_assets/icons/all-contests.svg";
import ArrowBackUpIcon from "@/app/_assets/icons/arrow-back-up.svg";
import ArrowRightIcon from "@/app/_assets/icons/arrow-right.svg";
import AvatarIcon from "@/app/_assets/icons/avatar.svg";
import CheckIcon from "@/app/_assets/icons/check.svg";
import CloseIcon from "@/app/_assets/icons/close.svg";
import DashboardIcon from "@/app/_assets/icons/dashboard.svg";
import DiscordIcon from "@/app/_assets/icons/discord.svg";
import ExclamationCircleIcon from "@/app/_assets/icons/exclamation-circle.svg";
import GoogleIcon from "@/app/_assets/icons/google.svg";
import LeaderboardIcon from "@/app/_assets/icons/leaderboard.svg";
import ChevronLeftIcon from "@/app/_assets/icons/chevron-left.svg";
import ChevronRightIcon from "@/app/_assets/icons/chevron-right.svg";
import ChevronUpIcon from "@/app/_assets/icons/chevron-up.svg";
import ChevronDownIcon from "@/app/_assets/icons/chevron-down.svg";
import LinkedinIcon from "@/app/_assets/icons/linkedin.svg";
import LogoutIcon from "@/app/_assets/icons/logout.svg";
import MenuIcon from "@/app/_assets/icons/menu.svg";
import OngoingContestIcon from "@/app/_assets/icons/ongoing-contest.svg";
import PlaySkipBackIcon from "@/app/_assets/icons/play-skip-back.svg";
import PlaySkipForwardIcon from "@/app/_assets/icons/play-skip-forward.svg";
import PlaybackIcon from "@/app/_assets/icons/play-back.svg";
import PlayForwardIcon from "@/app/_assets/icons/play-forward.svg";
import PlayIcon from "@/app/_assets/icons/play.svg";
import ShareIcon from "@/app/_assets/icons/share.svg";
import SortIcon from "@/app/_assets/icons/sort.svg";
import StopIcon from "@/app/_assets/icons/stop.svg";
import GithubIcon from "@/app/_assets/icons/github.svg";
import EllipsisIcon from "@/app/_assets/icons/ellipsis.svg";
import PlusIcon from "@/app/_assets/icons/plus.svg";
import MinusIcon from "@/app/_assets/icons/minus.svg";
import SettingIcon from "@/app/_assets/icons/setting.svg";
import { isDiscipline } from "@/app/_types";
import { cn } from "@/app/_utils/cn";
import { type HTMLAttributes, forwardRef } from "react";

export {
  AllContestsIcon,
  ArrowBackUpIcon,
  ArrowRightIcon,
  AvatarIcon,
  CheckIcon,
  CloseIcon,
  DashboardIcon,
  DiscordIcon,
  ExclamationCircleIcon,
  GoogleIcon,
  GithubIcon,
  LeaderboardIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  LinkedinIcon,
  LogoutIcon,
  MenuIcon,
  OngoingContestIcon,
  PlayForwardIcon,
  PlayIcon,
  PlaySkipBackIcon,
  PlaySkipForwardIcon,
  PlaybackIcon,
  ChevronRightIcon,
  ShareIcon,
  SortIcon,
  StopIcon,
  EllipsisIcon,
  PlusIcon,
  MinusIcon,
  SettingIcon,
};

type DisciplineIconProps = HTMLAttributes<SVGSVGElement> & {
  discipline: string;
};

const ICONS = {
  "3by3": Discipline3by3Icon,
  "2by2": Discipline2by2Icon,
} as const;
export const DisciplineIcon = forwardRef<SVGSVGElement, DisciplineIconProps>(
  ({ discipline: cube, className, ...props }, ref) => {
    const Comp = isDiscipline(cube) ? ICONS[cube] : PlaceholderIcon;
    return (
      <Comp
        {...props}
        ref={ref}
        className={cn("h-[27px] w-[27px]", className)}
      />
    );
  },
);
DisciplineIcon.displayName = "DisciplineIcon";

function PlaceholderIcon({ className }: { className?: string }) {
  return <svg className={cn("animate-pulse bg-grey-60", className)}></svg>;
}
