import { type Discipline } from '@/types'
import { cn } from '@/frontend/utils/cn'
import { type HTMLAttributes } from 'react'

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
import AverageIcon from '@/../public/icons/average.icon.svg'
import SingleIcon from '@/../public/icons/single.icon.svg'
import VscubingIcon from '@/../public/icons/vscubing.icon.svg'
import WcaLogoIcon from '@/../public/icons/wca-logo.icon.svg'

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
  AverageIcon,
  SingleIcon,
  VscubingIcon,
  WcaLogoIcon,
}
export {
  CodeXmlIcon,
  // TrophyIcon,
  MedalIcon,
  SquareArrowOutUpRight,
} from 'lucide-react'
export const TrophyIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    height='1.5em'
    viewBox='0 -960 960 960'
    width='1.5em'
    fill='currentColor'
  >
    <path d='M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z' />
  </svg>
)

type DisciplineIconProps = HTMLAttributes<SVGSVGElement> & {
  discipline: Discipline
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
  const Icon = ICONS[discipline]
  return (
    <Icon {...props} ref={ref} className={cn('h-[27px] w-[27px]', className)} />
  )
}
