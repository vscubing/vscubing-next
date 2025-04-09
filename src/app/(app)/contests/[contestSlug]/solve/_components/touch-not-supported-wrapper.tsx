'use client'

import { PrimaryButton } from '@/frontend/ui'
import { HintSection } from '@/frontend/shared/hint-section'
import { useMatchesScreen } from '@/frontend/utils/tailwind'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import Link from 'next/link'
import React, { type ReactNode } from 'react'

export function TouchNotSupportedWrapper({
  children,
}: {
  children: ReactNode
}) {
  const isTouchDevice = useIsTouchDevice()
  const isSmScreen = useMatchesScreen('sm')
  if (isTouchDevice) {
    return (
      <HintSection>
        <p>Solving from mobile devices is currently not supported</p>
        <PrimaryButton
          asChild
          size={isSmScreen ? 'sm' : 'lg'}
          className='sm:self-stretch'
        >
          <Link href='/'>Go to dashboard</Link>
        </PrimaryButton>
      </HintSection>
    )
  }

  return children
}
