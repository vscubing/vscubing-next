'use client'

import {
  ChevronDownIcon,
  ExclamationCircleIcon,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'
import {
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import {
  useSimulatorSettings,
  useMutateSimulatorSettings,
} from '../hooks/queries'
import { ColorschemeSetting } from './colorscheme-setting'
import { PUZZLE_SCALE } from '@/types'

export function SettingsList() {
  const { data: settings } = useSimulatorSettings()
  const { updateSettings } = useMutateSimulatorSettings()

  if (!settings)
    return (
      <ul className='z-10 flex-1 space-y-2'>
        <li className='h-20 animate-pulse rounded-xl bg-grey-100' />
        <li className='h-20 animate-pulse rounded-xl bg-grey-100' />
        <li className='h-20 animate-pulse rounded-xl bg-grey-100' />
      </ul>
    )

  return (
    <ul className='z-10 flex-1 space-y-2'>
      <li className='flex items-center justify-between gap-2 rounded-xl bg-grey-100 p-4'>
        <span>VRC base speed (tps):</span>
        <Select
          options={CS_ANIMATION_DURATION_OPTIONS}
          value={String(settings.animationDuration)}
          onValueChange={(val) =>
            updateSettings({
              animationDuration: Number(val),
            })
          }
        />
      </li>
      <li className='flex items-center justify-between gap-2 rounded-xl bg-grey-100 p-4'>
        <span>Preinspection voice alert at 8/12s:</span>
        <Select
          options={CS_INSPECTION_VOICE_ALERT_OPTIONS}
          value={settings.inspectionVoiceAlert}
          onValueChange={(inspectionVoiceAlert) =>
            updateSettings({ inspectionVoiceAlert })
          }
        />
      </li>
      <li className='flex items-center justify-between gap-2 rounded-xl bg-grey-100 p-4'>
        <span>Colorscheme:</span>
        <ColorschemeSetting />
      </li>
      <li className='flex items-center justify-between gap-2 rounded-xl bg-grey-100 p-4'>
        <span className='flex items-center gap-2'>
          <span className='vertical-alignment-fix'>Puzzle Scale:</span>
          <Popover>
            <PopoverTrigger className='outline-none'>
              <ExclamationCircleIcon />
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent className='caption max-w-[15.5rem]' side='bottom'>
                Use "+" and "-" keys to increase/decrease the puzzle size during
                a solve. <br />
                "=" resets the size to default.
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </span>
        <Select
          options={PUZZLE_SCALE_OPTIONS}
          value={settings.puzzleScale.toFixed(2)}
          onValueChange={(scale) =>
            updateSettings({ puzzleScale: parseFloat(scale) })
          }
        />
      </li>
    </ul>
  )
}

const CS_ANIMATION_DURATION_OPTIONS = [
  {
    value: '0',
    view: <span className='font-sans'>&infin;</span>,
  },
  { value: '50', view: '20' },
  { value: '100', view: '10' },
  { value: '200', view: '5' },
  { value: '500', view: '2' },
  { value: '1000', view: '1' },
] as const

const CS_INSPECTION_VOICE_ALERT_OPTIONS = [
  { value: 'Male', view: 'male voice' },
  { value: 'Female', view: 'female voice' },
  { value: 'None', view: 'none' },
] as const

const PUZZLE_SCALE_OPTIONS: { value: string }[] = []
for (
  let scale = PUZZLE_SCALE.MIN;
  scale <= PUZZLE_SCALE.MAX + 0.01; // 0.01 needed to fix floating point imprecision
  scale += PUZZLE_SCALE.STEP
) {
  PUZZLE_SCALE_OPTIONS.push({ value: scale.toFixed(2) })
}

function Select<T extends string>({
  options,
  value,
  onValueChange,
  className,
}: {
  options: Readonly<{ value: T; view?: ReactNode }[]>
  value: T
  onValueChange: (value: T) => void
  className?: string
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => onValueChange(val as T)}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'group flex h-12 min-w-[5.625rem] items-center justify-between gap-2 rounded-lg bg-black-100 px-4',
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
        className='mt-1 max-h-80 overflow-x-auto rounded-lg bg-black-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2'
        align='end'
        position='popper'
        style={{ minWidth: 'var(--radix-select-trigger-width)' }}
      >
        {options.map(({ value, view }) => (
          <SelectItem key={value} value={value}>
            {view ?? value}
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
