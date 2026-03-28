'use client'

import {
  ExclamationCircleIcon,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Select,
} from '@/frontend/ui'
import {
  useSimulatorSettings,
  useMutateSimulatorSettings,
} from '@/frontend/shared/simulator/use-simulator-settings'
import { ColorschemeSetting } from './colorscheme-setting'
import { PUZZLE_SCALE } from '@/types'

export function SettingsList() {
  const { data: settings } = useSimulatorSettings()
  const { updateSettings } = useMutateSimulatorSettings()

  if (!settings)
    return (
      <ul className='z-10 flex-1 space-y-2'>
        <li className='bg-grey-100 h-20 animate-pulse rounded-xl' />
        <li className='bg-grey-100 h-20 animate-pulse rounded-xl' />
        <li className='bg-grey-100 h-20 animate-pulse rounded-xl' />
      </ul>
    )

  return (
    <ul className='z-10 flex-1 space-y-2'>
      <li className='bg-grey-100 flex items-center justify-between gap-2 rounded-xl p-4'>
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
      <li className='bg-grey-100 flex items-center justify-between gap-2 rounded-xl p-4'>
        <span>Preinspection voice alert at 8/12s:</span>
        <Select
          options={CS_INSPECTION_VOICE_ALERT_OPTIONS}
          value={settings.inspectionVoiceAlert}
          onValueChange={(inspectionVoiceAlert) =>
            updateSettings({ inspectionVoiceAlert })
          }
        />
      </li>
      <li className='bg-grey-100 flex items-center justify-between gap-2 rounded-xl p-4'>
        <span>Colorscheme:</span>
        <ColorschemeSetting />
      </li>
      <li className='bg-grey-100 flex items-center justify-between gap-2 rounded-xl p-4'>
        <span className='flex items-center gap-2'>
          <span className='vertical-alignment-fix'>Puzzle Scale:</span>
          <Popover>
            <PopoverTrigger className='outline-none'>
              <ExclamationCircleIcon />
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent
                className='caption max-w-[15.5rem] p-4 text-center'
                side='bottom'
              >
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
