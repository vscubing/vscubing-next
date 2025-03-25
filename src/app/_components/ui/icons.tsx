import Discipline3by3Icon from '@/app/_assets/icons/discipline-3by3.icon.svg'
import Discipline2by2Icon from '@/app/_assets/icons/discipline-2by2.icon.svg'
import AllContestsIcon from '@/app/_assets/icons/all-contests.icon.svg'
import ArrowBackUpIcon from '@/app/_assets/icons/arrow-back-up.icon.svg'
import ArrowRightIcon from '@/app/_assets/icons/arrow-right.icon.svg'
import AvatarIcon from '@/app/_assets/icons/avatar.icon.svg'
import CheckIcon from '@/app/_assets/icons/check.icon.svg'
import CloseIcon from '@/app/_assets/icons/close.icon.svg'
import DashboardIcon from '@/app/_assets/icons/dashboard.icon.svg'
import DiscordIcon from '@/app/_assets/icons/discord.icon.svg'
import ExclamationCircleIcon from '@/app/_assets/icons/exclamation-circle.icon.svg'
import GoogleIcon from '@/app/_assets/icons/google.icon.svg'
import LeaderboardIcon from '@/app/_assets/icons/leaderboard.icon.svg'
import ChevronLeftIcon from '@/app/_assets/icons/chevron-left.icon.svg'
import ChevronRightIcon from '@/app/_assets/icons/chevron-right.icon.svg'
import ChevronUpIcon from '@/app/_assets/icons/chevron-up.icon.svg'
import ChevronDownIcon from '@/app/_assets/icons/chevron-down.icon.svg'
import LinkedinIcon from '@/app/_assets/icons/linkedin.icon.svg'
import LogoutIcon from '@/app/_assets/icons/logout.icon.svg'
import MenuIcon from '@/app/_assets/icons/menu.icon.svg'
import OngoingContestIcon from '@/app/_assets/icons/ongoing-contest.icon.svg'
import PlaySkipBackIcon from '@/app/_assets/icons/play-skip-back.icon.svg'
import PlaySkipForwardIcon from '@/app/_assets/icons/play-skip-forward.icon.svg'
import PlaybackIcon from '@/app/_assets/icons/play-back.icon.svg'
import PlayForwardIcon from '@/app/_assets/icons/play-forward.icon.svg'
import PlayIcon from '@/app/_assets/icons/play.icon.svg'
import ShareIcon from '@/app/_assets/icons/share.icon.svg'
import SortIcon from '@/app/_assets/icons/sort.icon.svg'
import StopIcon from '@/app/_assets/icons/stop.icon.svg'
import GithubIcon from '@/app/_assets/icons/github.icon.svg'
import EllipsisIcon from '@/app/_assets/icons/ellipsis.icon.svg'
import PlusIcon from '@/app/_assets/icons/plus.icon.svg'
import MinusIcon from '@/app/_assets/icons/minus.icon.svg'
import SettingIcon from '@/app/_assets/icons/setting.icon.svg'
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
