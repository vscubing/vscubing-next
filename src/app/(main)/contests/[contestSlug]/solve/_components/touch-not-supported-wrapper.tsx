'use client'

import { PrimaryButton } from '@/app/_components/ui'
import { HintSection } from '@/app/_shared/HintSection'
import { useMatchesScreen } from '@/app/_utils/tailwind'
import { useIsTouchDevice } from '@/app/_utils/useMediaQuery'
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
