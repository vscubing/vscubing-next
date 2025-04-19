import Link from 'next/link'
import { CodeXmlIcon, HoverPopover, TrophyIcon, WcaLogoIcon } from '../ui'

export function UserBadges({
  user: { records, role, wcaId },
}: {
  user: {
    wcaId: string | null
    role: 'admin' | null
    records?: number | null
  }
}) {
  return (
    <span className='flex items-center gap-2'>
      {role === 'admin' && <DeveloperBadge />}
      {records && <RecordHolderBadge records={records} />}
      {wcaId && <WcaBadgeLink wcaId={wcaId} />}
    </span>
  )
}

function WcaBadgeLink({ wcaId }: { wcaId: string }) {
  return (
    <Link href={`https://worldcubeassociation.org/persons/${wcaId}`}>
      <WcaLogoIcon className='text-xs' />
    </Link>
  )
}

function RecordHolderBadge({ records }: { records: number }) {
  return (
    <span className='text-amber-400 relative -mt-1 inline-flex h-5 w-5'>
      <TrophyIcon color='currentColor' />
      <span className='bg-amber-400 absolute -right-1 top-[-0.2rem] flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[2px] font-kanit text-[12px] font-medium text-grey-80'>
        {records}
      </span>
    </span>
  )
}

function DeveloperBadge() {
  return (
    <HoverPopover content='vscubing developer' asChild>
      <span className='inline-flex h-5 w-5 items-center justify-center gap-0.5 rounded-md border border-primary-60/20 bg-primary-60/10 p-0 text-xs font-semibold text-primary-60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'>
        <CodeXmlIcon />
      </span>
    </HoverPopover>
  )
}
