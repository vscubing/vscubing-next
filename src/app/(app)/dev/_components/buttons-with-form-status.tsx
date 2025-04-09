'use client'

import { PrimaryButton, SecondaryButton } from '@/frontend/ui'
import type { ComponentPropsWithoutRef } from 'react'
import { useFormStatus } from 'react-dom'

export function PrimaryButtonWithFormStatus(
  props: ComponentPropsWithoutRef<typeof PrimaryButton>,
) {
  const { pending } = useFormStatus()

  return <PrimaryButton {...props} disabled={pending} />
}

export function SecondaryButtonWithFormStatus(
  props: ComponentPropsWithoutRef<typeof SecondaryButton>,
) {
  const { pending } = useFormStatus()

  return <SecondaryButton {...props} disabled={pending} />
}
