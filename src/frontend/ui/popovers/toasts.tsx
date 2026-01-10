'use client'

import { cn } from '@/frontend/utils/cn'
import type { ReactNode } from 'react'
import * as Sonner from 'sonner'

export function Toaster() {
  return (
    <Sonner.Toaster
      toastOptions={{
        unstyled: true,
        classNames: {
          title: 'text-white-100 btn-sm mb-3',
          description: 'text-white caption',
          // we can remove !imporant in actionButton and closeButton after https://github.com/emilkowalski/sonner/issues/321 is fixed
          actionButton:
            'self-end whitespace-nowrap underline underline-offset-2 decoration-from-font -mb-[.15rem] !btn-sm !bg-transparent !text-base !rounded-none !transition-base !outline-ring !inline-flex !items-center !justify-center !h-auto !px-0 !text-primary-80 !hover:text-primary-60 !active:text-primary-80 !disabled:text-grey-60',
          closeButton:
            '!left-auto [&>svg]:!h-[1.1rem] [&>svg]:!w-[1.1rem] [&>svg]:stroke-[.2rem] !right-2 !top-2 !translate-x-0 !translate-y-0 !h-8 !w-8 !bg-transparent !border-none !text-grey-40',
        },
      }}
    ></Sonner.Toaster>
  )
}

export const TOASTS_PRESETS = {
  noConnection: {
    dedupId: 'noConnection',
    title: 'Uh-oh! No Internet connection',
    description: 'Check your connection and get back to the fun. Need help?',
    contactUsButton: true,
  },
  internalError: {
    dedupId: 'internalError',
    title: 'Uh-oh! Something went wrong',
    description:
      "Try reloading the page. If it doesn't help, please reach out to us.",
    contactUsButton: true,
  },
} satisfies Record<string, Toast>

const DURATIONS = {
  short: 3_000,
  normal: 10_000,
  long: 30_000,
  infinite: Infinity,
} as const

export type Toast = {
  dedupId?: string
  title: ReactNode
  description: ReactNode
  contactUsButton?: boolean
  contactUsButtonLabel?: string
  duration?: keyof typeof DURATIONS
  variant?: 'default' | 'festive'
  className?: string
}
export function toast({
  title,
  description,
  contactUsButton = false,
  contactUsButtonLabel,
  duration = 'normal',
  dedupId,
  variant = 'default',
  className,
}: Toast) {
  Sonner.toast(title, {
    closeButton: true,
    description,
    action: contactUsButton
      ? {
          label: contactUsButtonLabel ?? 'Contact us',
          onClick: () => window.open('https://discord.gg/PxFrW9vTAy', '_blank'),
        }
      : undefined,
    duration: DURATIONS[duration],
    id: dedupId,
    className: cn(
      'bg-grey-80 py-4 pl-4 pr-10 rounded-xl flex gap-4 right-0 min-w-[20rem]',
      {
        "bg-[url('/images/confetti-festive-toast.svg')] bg-no-repeat":
          variant === 'festive',
      },
      className,
    ),
  })
}
