import type { User } from '@/types'
import { HoverPopover, CodeXmlIcon } from '@/frontend/ui'
import { RecordHolderBadge } from './record-holder-badge'
import { WcaBadgeLink } from './wca-badge'

export function UserBadges({ user }: { user: User }) {
  return (
    <span className='flex items-center gap-2'>
      {user.role === 'admin' && <DeveloperBadge />}
      {user.globalRecords && (
        <RecordHolderBadge records={user.globalRecords} name={user.name} />
      )}
      {user.wcaId && <WcaBadgeLink wcaId={user.wcaId} />}
    </span>
  )
}

function DeveloperBadge() {
  return (
    <HoverPopover
      content='vscubing developer'
      contentProps={{ className: 'border-b-2 border-primary-100' }}
      asChild
    >
      <span className='inline-flex h-5 w-5 items-center justify-center gap-0.5 rounded-md text-xs font-semibold text-primary-60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'>
        <CodeXmlIcon />
      </span>
    </HoverPopover>
  )
}
