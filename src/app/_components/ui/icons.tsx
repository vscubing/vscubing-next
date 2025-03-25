import Discipline3by3Icon from '@/../public/icons/discipline-3by3.icon.svg'
import Discipline2by2Icon from '@/../public/icons/discipline-2by2.icon.svg'
import AllContestsIcon from '@/../public/icons/all-contests.icon.svg'
import ArrowBackUpIcon from '@/../public/icons/arrow-back-up.icon.svg'
import ArrowRightIcon from '@/../public/icons/arrow-right.icon.svg'
import AvatarIcon from '@/../public/icons/avatar.icon.svg'
import CheckIcon from '@/../public/icons/check.icon.svg'
import CloseIcon from '@/../public/icons/close.icon.svg'
import DashboardIcon from '@/../public/icons/dashboard.icon.svg'
import DiscordIcon from '@/../public/icons/discord.icon.svg'
import ExclamationCircleIcon from '@/../public/icons/exclamation-circle.icon.svg'
import GoogleIcon from '@/../public/icons/google.icon.svg'
import LeaderboardIcon from '@/../public/icons/leaderboard.icon.svg'
import ChevronLeftIcon from '@/../public/icons/chevron-left.icon.svg'
import ChevronRightIcon from '@/../public/icons/chevron-right.icon.svg'
import ChevronUpIcon from '@/../public/icons/chevron-up.icon.svg'
import ChevronDownIcon from '@/../public/icons/chevron-down.icon.svg'
import LinkedinIcon from '@/../public/icons/linkedin.icon.svg'
import LogoutIcon from '@/../public/icons/logout.icon.svg'
import MenuIcon from '@/../public/icons/menu.icon.svg'
import OngoingContestIcon from '@/../public/icons/ongoing-contest.icon.svg'
import PlaySkipBackIcon from '@/../public/icons/play-skip-back.icon.svg'
import PlaySkipForwardIcon from '@/../public/icons/play-skip-forward.icon.svg'
import PlaybackIcon from '@/../public/icons/play-back.icon.svg'
import PlayForwardIcon from '@/../public/icons/play-forward.icon.svg'
import PlayIcon from '@/../public/icons/play.icon.svg'
import ShareIcon from '@/../public/icons/share.icon.svg'
import SortIcon from '@/../public/icons/sort.icon.svg'
import StopIcon from '@/../public/icons/stop.icon.svg'
import GithubIcon from '@/../public/icons/github.icon.svg'
import EllipsisIcon from '@/../public/icons/ellipsis.icon.svg'
import PlusIcon from '@/../public/icons/plus.icon.svg'
import MinusIcon from '@/../public/icons/minus.icon.svg'
import SettingIcon from '@/../public/icons/setting.icon.svg'
import { isDiscipline } from '@/app/_types'
import { cn } from '@/app/_utils/cn'
import { type HTMLAttributes, forwardRef } from 'react'

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
}

type DisciplineIconProps = HTMLAttributes<SVGSVGElement> & {
  discipline: string
}

const ICONS = {
  '3by3': Discipline3by3Icon,
  '2by2': Discipline2by2Icon,
} as const
export const DisciplineIcon = forwardRef<SVGSVGElement, DisciplineIconProps>(
  ({ discipline: cube, className, ...props }, ref) => {
    const Comp = isDiscipline(cube) ? ICONS[cube] : PlaceholderIcon
    return (
      <Comp
        {...props}
        ref={ref}
        className={cn('h-[27px] w-[27px]', className)}
      />
    )
  },
)
DisciplineIcon.displayName = 'DisciplineIcon'

function PlaceholderIcon({ className }: { className?: string }) {
  return <svg className={cn('animate-pulse bg-grey-60', className)}></svg>
}
