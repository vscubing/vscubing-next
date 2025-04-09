'use client'

import { atom, useSetAtom } from 'jotai'
import type { ComponentProps } from 'react'

export const mobileMenuOpenAtom = atom(false)
export function ControlMobileMenuButton({
  mode,
  ...props
}: ComponentProps<'button'> & { mode: boolean }) {
  const setOpenOnMobile = useSetAtom(mobileMenuOpenAtom)
  return (
    <button
      aria-label='Open the sidebar'
      onClick={() => setOpenOnMobile(mode)}
      {...props}
    />
  )
}
