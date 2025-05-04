import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { cn } from '@/frontend/utils/cn'
import React, { useEffect, useState } from 'react'
import { useDebounceValue, useEventListener } from 'usehooks-ts'
import { useSimulatorSettings } from '../hooks/queries'

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
  useEventListener('keydown', (event) => {
    if (event.key === ' ') {
      setIsDirty(!isDirty)
      if (isDirty) {
        setScramble(scramble === '' ? ' ' : '') // HACK: a little hack to trigger a scramble update (changing it form '' to '' wouldn't do anything)
      } else {
        setScramble(badRandomScramble())
      }
      return
    }

    if (!isDirty) setIsDirty(true)
    applyKeyboardMove(event)
  })

  return (
    <div
      ref={simulatorRef}
      className={cn(
        'flex items-center justify-center rounded-2xl bg-black-80 [&>div]:flex [&>div]:justify-center',
        className,
      )}
    />
  )
}

function badRandomScramble() {
  const MOVES = ['R', 'U', 'F', 'B', 'L', 'D']
  return Array.from({ length: 20 })
    .map(() => MOVES[Math.floor(Math.random() * MOVES.length)])
    .join(' ')
}
