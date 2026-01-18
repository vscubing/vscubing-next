import { useEffect, useState } from 'react'
import {
  useSimulatorSettings,
  useMutateSimulatorSettings,
} from '../hooks/queries'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/frontend/utils/cn'
import { HexColorPicker } from 'react-colorful'
import { Input, SecondaryButton } from '@/frontend/ui'
import { TWISTY_DEFAULT_COLORSCHEME } from 'vendor/cstimer/constants'
import { RotateCcwIcon } from 'lucide-react'
import { useDebounceCallback } from 'usehooks-ts'

export function ColorschemeSetting() {
  const { data: settings } = useSimulatorSettings()
  const { updateSettings } = useMutateSimulatorSettings()

  if (!settings) return
  const colorscheme = settings.colorscheme ?? TWISTY_DEFAULT_COLORSCHEME
  return (
    <div className='flex h-12 items-center gap-3'>
      <SecondaryButton
        size='sm'
        disabled={
          JSON.stringify(colorscheme) ===
          JSON.stringify(TWISTY_DEFAULT_COLORSCHEME)
        }
        onClick={() => updateSettings({ colorscheme: null })}
      >
        Reset all
      </SecondaryButton>
      <ul className='grid grid-cols-6 gap-2 sm:grid-cols-3 sm:gap-1'>
        {(['U', 'R', 'F', 'D', 'L', 'B'] as const).map((face) => (
          <li key={face}>
            <ColorPicker
              value={'#' + colorscheme[face].toString(16).padStart(6, '0')}
              onReset={() => {
                updateSettings({
                  colorscheme: {
                    ...colorscheme,
                    [face]: TWISTY_DEFAULT_COLORSCHEME[face],
                  },
                })
              }}
              resetDisabled={
                JSON.stringify(colorscheme[face]) ===
                JSON.stringify(TWISTY_DEFAULT_COLORSCHEME[face])
              }
              onChange={(color) => {
                const withoutHash = color.slice(1)
                updateSettings({
                  colorscheme: {
                    ...colorscheme,
                    [face]: parseInt(withoutHash, 16),
                  },
                })
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

type ColorPickerProps = {
  value: string
  onChange: (value: string) => void
  onReset: () => void
  resetDisabled: boolean
  className?: string
}

function ColorPicker({
  value,
  onChange,
  className,
  onReset,
  resetDisabled,
  ...props
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValid, setInputValid] = useState(true)
  const [inputValue, setInputValue] = useState(value)
  const debouncedOnChange = useDebounceCallback(onChange, 50)

  useEffect(() => {
    setInputValid(true)
    setInputValue(value)
  }, [value])

  return (
    <PopoverPrimitive.Popover onOpenChange={setOpen} open={open}>
      <PopoverPrimitive.Trigger asChild>
        <button
          {...props}
          className={cn(
            'm-[-2px] block h-11 w-11 rounded-lg border-2 border-transparent bg-clip-padding hover:border-black-100 sm:h-6 sm:w-6',
            className,
          )}
          onClick={() => setOpen(true)}
          style={{ backgroundColor: value }}
        ></button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content className='w-full' collisionPadding={32}>
        <HexColorPicker
          color={value}
          onChange={debouncedOnChange}
          className='mb-1'
        />
        <div className='flex gap-1'>
          <Input
            maxLength={7}
            className={cn(
              'w-[calc(200px-2.75rem-0.25rem)] border-2 border-transparent',
              {
                'border-red-100': !inputValid,
              },
            )}
            onChange={(e) => {
              const value = e.currentTarget.value
              if (!value.startsWith('#')) return
              setInputValue(value)

              if (isValidHexColor(value.slice(1))) {
                onChange(value)
                setInputValid(true)
              } else {
                setInputValid(false)
              }
            }}
            value={inputValue}
          />

          <SecondaryButton
            onClick={onReset}
            className='h-[2.75rem] w-[2.75rem] p-0 sm:h-[2.75rem] sm:w-[2.75rem]'
            disabled={resetDisabled}
          >
            <RotateCcwIcon />
          </SecondaryButton>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Popover>
  )
}

function isValidHexColor(str: string) {
  if (str.length !== 6) return false

  const hexRegex = /^[0-9a-fA-F]+$/
  return hexRegex.test(str)
}
