import Link from 'next/link'
import { CodeXmlIcon, HoverPopover, TrophyIcon, WcaLogoIcon } from '../ui'

export function UserBadges({
  user: { role, wcaId, averageRecords, singleRecords },
}: {
  user: {
    wcaId: string | null
    role: 'admin' | null
    averageRecords: number
    singleRecords: number
  }
}) {
  const recordsTotal = averageRecords + singleRecords
  return (
    <span className='flex items-center gap-2'>
      {role === 'admin' && <DeveloperBadge />}
      {recordsTotal > 0 && <RecordHolderBadge records={recordsTotal} />}
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
    <HoverPopover
      content={<RecordHolderPopover />}
      contentProps={{ className: 'border-b-2 border-amber-400' }}
      asChild
    >
      <span className='relative -mt-1 inline-flex h-5 w-5 text-amber-400'>
        <TrophyIcon color='currentColor' />
        <span className='absolute -right-1 top-[-0.2rem] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-amber-400 px-[2px] font-kanit text-[12px] font-medium text-grey-80'>
          {records}
        </span>
      </span>
    </HoverPopover>
  )
}

function RecordHolderPopover() {
  return 'record holder'
}

function DeveloperBadge() {
  return (
    <HoverPopover
      content='vscubing developer'
      contentProps={{ className: 'border-b-2 border-primary-100' }}
      asChild
    >
      <span className='inline-flex h-5 w-5 items-center justify-center gap-0.5 rounded-md border border-primary-60/20 bg-primary-60/10 p-0 text-xs font-semibold text-primary-60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'>
        <CodeXmlIcon />
      </span>
    </HoverPopover>
  )
}
