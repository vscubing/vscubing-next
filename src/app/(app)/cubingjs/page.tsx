'use client'

import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { LoadingSpinner } from '@/frontend/ui'
import { PrimaryButton, SecondaryButton } from '@/frontend/ui/buttons'
import { QuantumMove } from '@vscubing/cubing/alg'
import type { KPattern, KPuzzle } from '@vscubing/cubing/kpuzzle'
import { puzzles } from '@vscubing/cubing/puzzles'
import { useEffect, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

export default function CubingJsPage() {
  const [pattern, setPattern] = useState<KPattern | undefined>()
  const kpuzzleRef = useRef<KPuzzle | null>(null)
  const [colorscheme, setColorscheme] = useState<'light' | 'dark'>('light')
  const [cameraMode, setCameraMode] = useState<'default' | 'top'>('default')

  const cameraPosition =
    cameraMode === 'top'
      ? { latitude: 75, longitude: 0, distance: 6.5 }
      : undefined

  const { simulatorRef, applyMove, applyKeyboardMove } =
    useControllableSimulator({
      discipline: '3by3',
      pattern,
      colorscheme,
      cameraPosition,
    })

  useEventListener('keydown', (event) => {
    applyKeyboardMove(event)
  })

  useEffect(() => {
    let active = true
    void puzzles['3x3x3']!.kpuzzle().then((kpuzzle) => {
      if (!active) return
      kpuzzleRef.current = kpuzzle
      setPattern(kpuzzle.defaultPattern())
    })
    return () => {
      active = false
    }
  }, [])

  function setPatternAlg(alg: string) {
    const kpuzzle = kpuzzleRef.current
    if (!kpuzzle) return
    const base = kpuzzle.defaultPattern()
    setPattern(alg ? base.applyAlg(alg) : base)
  }

  function animateMove(move: QuantumMove) {
    applyMove(move)
  }

  function toggleColorscheme() {
    setColorscheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  function toggleCamera() {
    setCameraMode((prev) => (prev === 'top' ? 'default' : 'top'))
  }

  return (
    <>
      <LayoutHeaderTitlePortal>Experimental</LayoutHeaderTitlePortal>
      <div className='flex flex-1 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
        <div className='flex flex-1 items-center justify-center'>
          {!pattern ? (
            <LoadingSpinner size='lg' />
          ) : (
            <div
              ref={simulatorRef}
              className='flex aspect-square h-[28rem] w-[35rem] outline-none [&>twisty-player]:h-full [&>twisty-player]:w-full'
            />
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          <PrimaryButton
            size='sm'
            onClick={() => animateMove(new QuantumMove('R'))}
          >
            Animate R
          </PrimaryButton>
          <PrimaryButton
            size='sm'
            onClick={() => animateMove(new QuantumMove('U'))}
          >
            Animate U
          </PrimaryButton>
          <SecondaryButton size='sm' onClick={() => setPatternAlg('')}>
            Reset pattern
          </SecondaryButton>
          <SecondaryButton size='sm' onClick={() => setPatternAlg("R U R' U'")}>
            Set pattern
          </SecondaryButton>
          <SecondaryButton size='sm' onClick={toggleColorscheme}>
            Theme: {colorscheme}
          </SecondaryButton>
          <SecondaryButton size='sm' onClick={toggleCamera}>
            Camera: {cameraMode}
          </SecondaryButton>
        </div>
      </div>
    </>
  )
}
