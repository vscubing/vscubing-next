'use client'

import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { cn } from '@/frontend/utils/cn'
import React, { useEffect, useState, type RefObject } from 'react'
import { useDebounceValue, useEventListener } from 'usehooks-ts'
import { useSimulatorSettings } from '../hooks/queries'
import { LoadingSpinner } from '@/frontend/ui'

export function SettingsPreviewSimulator({
  className,
}: {
  className?: string
}) {
  const { data: settings } = useSimulatorSettings()
  const [debouncedSettings] = useDebounceValue(settings, 50)

  const [scramble, setScramble] = useState('')
  const { applyKeyboardMove, simulatorRef } = useControllableSimulator({
    discipline: '3by3',
    scramble,
    settings: {
      colorscheme: debouncedSettings?.colorscheme,
      animationDuration: debouncedSettings?.animationDuration,
    },
  })

  useEffect(() => setScramble(''), [settings?.colorscheme])

  const [isDirty, setIsDirty] = useState(false)

  useEventListener(
    'dblclick',
    scrambleOnUnscramble,
    simulatorRef as RefObject<HTMLDivElement>,
  )

  useEventListener('keydown', (event) => {
    if (event.key === ' ') {
      scrambleOnUnscramble()
    }

    if (!isDirty && !isRotation(event)) setIsDirty(true)
    applyKeyboardMove(event)
  })

  function scrambleOnUnscramble() {
    if (isDirty) {
      setScramble(scramble === '' ? ' ' : '') // HACK: a little hack to trigger a scramble update (changing it form '' to '' wouldn't do anything)
    } else {
      setScramble(badRandomScramble())
    }
    setIsDirty(!isDirty)
  }

  if (!settings) {
    return (
      <div className='flex h-[300px] w-[300px] items-center justify-center'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <div
        ref={simulatorRef}
        className={cn(
          'flex h-[300px] w-[300px] items-center justify-center rounded-2xl bg-black-80',
          className,
        )}
      />
      <p className='caption -mt-4 text-center text-grey-40'>
        <span className='touch:hidden'>
          Pro tip: press space to scramle/unscramble
        </span>
        <span className='hidden touch:block'>
          Pro tip: double tap to scramle/unscramble
        </span>
      </p>
    </div>
  )
}

function badRandomScramble() {
  const MOVES = ['R', 'U', 'F', 'B', 'L', 'D']
  return Array.from({ length: 20 })
    .map(() => MOVES[Math.floor(Math.random() * MOVES.length)])
    .join(' ')
}

function isRotation(event: KeyboardEvent) {
  return [65, 59, 66, 78, 84, 89].includes(event.keyCode)
}
