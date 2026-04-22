'use client'

import { useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { useSimulatorSettings } from '@/frontend/shared/simulator/use-simulator-settings'
import { LoadingSpinner } from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'

type ParityType = 'oll' | 'pll'

const PARITY_ALGS: Record<
  ParityType,
  { name: string; alg: string; setup: string }[]
> = {
  oll: [
    {
      name: 'Standard',
      alg: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
      setup: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
    },
  ],
  pll: [
    {
      name: 'Standard (opposite edges)',
      alg: '2R2 U2 2R2 Uw2 2R2 Uw2',
      setup: '2-2R2 U2 2-2R2 Uw2 2-2R2 Uw2',
    },
  ],
}

const ROTATIONS = ['', 'x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2']

let setupCounter = 0
function generateSetup(parityType: ParityType): string {
  const rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]
  const setupAlg = PARITY_ALGS[parityType][0]!.setup
  // Append y y' (no-op) on alternating calls to ensure the string always changes,
  // so React triggers the scramble effect even if the random rotation is the same
  const noop = ++setupCounter % 2 === 0 ? " y y'" : ''
  return [rotation, setupAlg].filter(Boolean).join(' ') + noop
}

export default function ParityTrainerPage() {
  const { data: settings } = useSimulatorSettings()
  const [parityType, setParityType] = useState<ParityType>('oll')
  const [scramble, setScramble] = useState(() => generateSetup('oll'))

  const { applyKeyboardMove, simulatorRef } = useControllableSimulator({
    discipline: '4by4',
    scramble,
  })

  function reapplyScramble() {
    setScramble(generateSetup(parityType))
  }

  function switchParityType(type: ParityType) {
    if (type === parityType) return
    setParityType(type)
    setScramble(generateSetup(type))
  }

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      reapplyScramble()
      return
    }

    applyKeyboardMove(event)
  })

  if (!settings) {
    return (
      <>
        <LayoutHeaderTitlePortal>Parity Trainer</LayoutHeaderTitlePortal>
        <div className='flex flex-1 items-center justify-center'>
          <LoadingSpinner size='lg' />
        </div>
      </>
    )
  }

  return (
    <>
      <LayoutHeaderTitlePortal>Parity Trainer</LayoutHeaderTitlePortal>
      <div className='flex flex-1 flex-col gap-3'>
        <ExperimentalBadge />
        <div className='bg-black-80 flex flex-1 flex-col items-center gap-6 rounded-2xl p-6 sm:p-4'>
          {/* Parity type toggle */}
          <div className='flex gap-2'>
            {(['oll', 'pll'] as const).map((type) => (
              <button
                key={type}
                onClick={() => switchParityType(type)}
                className={cn(
                  'btn-sm rounded-lg px-4 py-2 font-medium uppercase transition',
                  parityType === type
                    ? 'bg-primary-80 text-black-100'
                    : 'bg-grey-80 text-white-100 hover:bg-grey-60',
                )}
              >
                {type} parity
              </button>
            ))}
          </div>

          {/* Cube */}
          <div
            ref={simulatorRef}
            className='bg-black-100 flex h-[300px] w-[300px] items-center justify-center rounded-2xl sm:h-[250px] sm:w-[250px]'
          />

          {/* Hint */}
          <p className='caption text-grey-40'>
            Press{' '}
            <kbd className='bg-grey-80 rounded px-1.5 py-0.5 font-mono text-xs'>
              Esc
            </kbd>{' '}
            to reset the scramble
          </p>

          {/* Suggested algorithms */}
          <div className='w-full max-w-lg'>
            <h3 className='title-h3 text-grey-20 mb-3'>Suggested algorithms</h3>
            <div className='flex flex-col gap-2'>
              {PARITY_ALGS[parityType].map(({ name, alg }) => (
                <div key={name} className='bg-black-100 rounded-lg px-4 py-3'>
                  <p className='caption text-grey-40 mb-1'>{name}</p>
                  <p className='text-white-100 font-mono text-sm'>{alg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
