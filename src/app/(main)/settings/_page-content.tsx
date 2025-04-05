'use client'

import { ChevronDownIcon } from '@/app/_components/ui'
import { cn } from '@/app/_utils/cn'
import type { ReactNode, ComponentPropsWithoutRef, ComponentRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useSimulatorSettings, useSimulatorSettingsMutation } from './queries'

export function PageContent() {
  const { data: settings } = useSimulatorSettings()
  const { mutate: mutateSettings } = useSimulatorSettingsMutation()

  if (!settings)
    return (
      <ul className='space-y-2'>
        <li className='h-20 animate-pulse rounded-xl bg-grey-100'></li>
        <li className='h-20 animate-pulse rounded-xl bg-grey-100'></li>
      </ul>
    )

  return (
    <ul className='space-y-2'>
      {settings ? (
        <>
          <li className='flex items-center justify-between rounded-xl bg-grey-100 p-4'>
            <span>VRC base speed (tps):</span>
            <Select
              options={CS_ANIMATION_DURATION_OPTIONS}
              value={String(settings.animationDuration)}
              onValueChange={(val) =>
                mutateSettings({ animationDuration: Number(val) })
              }
            />
          </li>
          <li className='flex items-center justify-between gap-2 rounded-xl bg-grey-100 p-4'>
            <span>Preinspection voice alert at 8/12s:</span>
            <Select
              options={CS_INSPECTION_VOICE_ALERT_OPTIONS}
              value={settings.inspectionVoiceAlert}
              onValueChange={(inspectionVoiceAlert) =>
                mutateSettings({
                  inspectionVoiceAlert:
                    inspectionVoiceAlert as typeof settings.inspectionVoiceAlert,
                })
              }
              className='min-w-[9rem]'
            />
          </li>
        </>
      ) : (
        <li className='h-20 animate-pulse rounded-xl bg-grey-100'></li>
      )}
    </ul>
  )
}

const CS_ANIMATION_DURATION_OPTIONS = [
  { value: '0', content: <span className='font-sans'>&infin;</span> },
  { value: '50', content: '20' },
  { value: '100', content: '10' },
  { value: '200', content: '5' },
  { value: '500', content: '2' },
  { value: '1000', content: '1' },
]

const CS_INSPECTION_VOICE_ALERT_OPTIONS = [
  { value: 'Male', content: 'male voice' },
  { value: 'Female', content: 'female voice' },
  { value: 'None', content: 'none' },
]

function Select({
  options,
  value,
  onValueChange,
  className,
}: {
  options: { value: string; content: ReactNode }[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => onValueChange(val)}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'group flex h-12 min-w-[5.625rem] items-center justify-between gap-2 rounded-lg bg-black-100 px-4 text-left',
          className,
        )}
      >
        <span className='text-large'>
          <SelectPrimitive.Value />
        </span>
        <SelectPrimitive.Icon>
          <ChevronDownIcon className='h-4 w-4 group-data-[state=open]:rotate-180' />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content
        className='mt-1 rounded-lg bg-black-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2'
        position='popper'
        style={{ width: 'var(--radix-select-trigger-width)' }}
      >
        {options.map(({ value, content }) => (
          <SelectItem key={value} value={value}>
            {content}
          </SelectItem>
        ))}
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  )
}

function SelectItem({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  ref?: React.RefObject<ComponentRef<typeof SelectPrimitive.Item>>
}) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'text-large flex w-full min-w-[5.625rem] cursor-pointer items-center rounded-lg px-4 py-[0.625rem] outline-none hover:bg-primary-100 active:bg-primary-100 data-[state=checked]:bg-primary-100',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
