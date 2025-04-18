import Link from 'next/link'
import React, { type ComponentPropsWithRef } from 'react'
import { WcaLogoIcon } from '../ui'

export default function WcaBadgeLink({
  wcaId,
  ...props
}: { wcaId: string } & Omit<ComponentPropsWithRef<typeof Link>, 'href'>) {
  return (
    <Link href={`https://worldcubeassociation.org/persons/${wcaId}`} {...props}>
      <WcaLogoIcon className='text-xs' />
    </Link>
  )
}
