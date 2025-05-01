'use client'

import { LayoutHeaderTitlePortal } from '../_layout'
import { useControllableSimulator } from '../live-streams/page'
import { useEventListener } from 'usehooks-ts'

export default function CubeTogetherPage() {
  const { simulatorRef, applyKeyboardMove } = useControllableSimulator({
    discipline: '3by3',
    scramble: "y y'",
  })

  useEventListener('keydown', (e) => applyKeyboardMove(e))

  return (
    <>
      <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
      <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'>
        <div
          ref={simulatorRef}
          className='aspect-square h-[70%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]'
        />
      </div>
    </>
  )
}
