'use client'

import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
// TODO: VERY IMPORTANT!!!! move this to shared/
// import Simulator from '../contests/[contestSlug]/solve/_components/simulator/components/simulator/simulator.lazy'
import { useEffect, useState } from 'react'
import type { InitSolveData } from '../contests/[contestSlug]/solve/_components/simulator/components/simulator/types'
import Simulator from '../contests/[contestSlug]/solve/_components/simulator/components/simulator/simulator.lazy'
import { randomScrambleForEvent } from '@vscubing/cubing/scramble'

export default function DojoPage() {
  const [initSolveData, setInitSolveData] = useState<InitSolveData | null>(null)

  useEffect(() => {
    // window.randomScrambleForEvent = randomScrambleForEvent
    void (async () => {
      setInitSolveData({
        discipline: '3by3',
        scramble: (await randomScrambleForEvent('333')).toString(),
        // scramble: 'R U',
      })
    })()
  }, [])

  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Dojo</LayoutHeaderTitlePortal>
      <div className='flex h-full flex-col rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
        {initSolveData && (
          <Simulator
            initSolveData={initSolveData}
            onSolveFinish={alert}
            onInspectionStart={() => {}}
          />
        )}
      </div>
    </>
  )
}
