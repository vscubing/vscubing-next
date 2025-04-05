import Discipline3by3Icon from '@/../public/icons/discipline-3by3.svg?inline'
import Discipline2by2Icon from '@/../public/icons/discipline-2by2.svg?inline'
import AllContestsIcon from '@/../public/icons/all-contests.svg?inline'
import ArrowBackUpIcon from '@/../public/icons/arrow-back-up.svg?inline'
import ArrowRightIcon from '@/../public/icons/arrow-right.svg?inline'
import AvatarIcon from '@/../public/icons/avatar.svg?inline'
import CheckIcon from '@/../public/icons/check.svg?inline'
import CloseIcon from '@/../public/icons/close.svg?inline'
import DashboardIcon from '@/../public/icons/dashboard.svg?inline'
import DiscordIcon from '@/../public/icons/discord.svg?inline'
import ExclamationCircleIcon from '@/../public/icons/exclamation-circle.svg?inline'
import GoogleIcon from '@/../public/icons/google.svg?inline'
import LeaderboardIcon from '@/../public/icons/leaderboard.svg?inline'
import ChevronLeftIcon from '@/../public/icons/chevron-left.svg?inline'
import ChevronRightIcon from '@/../public/icons/chevron-right.svg?inline'
import ChevronUpIcon from '@/../public/icons/chevron-up.svg?inline'
import ChevronDownIcon from '@/../public/icons/chevron-down.svg?inline'
import LinkedinIcon from '@/../public/icons/linkedin.svg?inline'
import LogoutIcon from '@/../public/icons/logout.svg?inline'
import MenuIcon from '@/../public/icons/menu.svg?inline'
import OngoingContestIcon from '@/../public/icons/ongoing-contest.svg?inline'
import PlaySkipBackIcon from '@/../public/icons/play-skip-back.svg?inline'
import PlaySkipForwardIcon from '@/../public/icons/play-skip-forward.svg?inline'
import PlaybackIcon from '@/../public/icons/play-back.svg?inline'
import PlayForwardIcon from '@/../public/icons/play-forward.svg?inline'
import PlayIcon from '@/../public/icons/play.svg?inline'
import ShareIcon from '@/../public/icons/share.svg?inline'
import SortIcon from '@/../public/icons/sort.svg?inline'
import StopIcon from '@/../public/icons/stop.svg?inline'
import GithubIcon from '@/../public/icons/github.svg?inline'
import EllipsisIcon from '@/../public/icons/ellipsis.svg?inline'
import PlusIcon from '@/../public/icons/plus.svg?inline'
import MinusIcon from '@/../public/icons/minus.svg?inline'
import SettingIcon from '@/../public/icons/setting.svg?inline'
import CodeIcon from '@/../public/icons/code.svg?inline'

import { isDiscipline } from '@/app/_types'
import { cn } from '@/app/_utils/cn'
import { type HTMLAttributes } from 'react'

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
  CodeIcon,
}

type DisciplineIconProps = HTMLAttributes<SVGSVGElement> & {
  discipline: string
}

const ICONS = {
  '3by3': Discipline3by3Icon,
  '2by2': Discipline2by2Icon,
} as const
export function DisciplineIcon({
  ref,
  discipline,
  className,
  ...props
}: DisciplineIconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) {
  const Comp = isDiscipline(discipline) ? ICONS[discipline] : PlaceholderIcon
  return (
    <Comp {...props} ref={ref} className={cn('h-[27px] w-[27px]', className)} />
  )
}

function PlaceholderIcon({ className }: { className?: string }) {
  return <svg className={cn('animate-pulse bg-grey-60', className)}></svg>
}
