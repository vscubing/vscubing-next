'use client'

import { useEffect, useState } from 'react'
import { LayoutHeaderTitlePortal } from '../_layout'
import { useControllableSimulator } from '../live-streams/page'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import { z } from 'zod'

export default function CubeTogetherPage() {
  const [scramble, setScramble] = useState<string>()

  const handleMessage = useEventCallback((event: MessageEvent) => {
    if (typeof event.data !== 'string')
      throw new Error('expected string event.data')
    const message = messageSchema.parse(JSON.parse(event.data))
    if (message.type === 'history') {
      // setScramble('')
    }
    if (message.type === 'move') {
      applyKeyboardMove({ keyCode: +message.payload } as KeyboardEvent)
    }
  })

  const [ws, setWs] = useState<WebSocket>()
  useEffect(() => {
    const _ws = new WebSocket('ws://localhost:8787/ws')
    _ws.addEventListener('message', handleMessage, {})
    setWs(_ws)
    return () => _ws.close()
  }, [handleMessage])

  const { simulatorRef, applyKeyboardMove } = useControllableSimulator({
    discipline: '3by3',
    scramble: scramble ?? "y y'",
    // enabled: scramble !== undefined,
  })

  useEventListener('keydown', (e) => ws?.send(String(e.keyCode)))

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

const messageSchema = z.union([
  z.object({ type: z.literal('history'), payload: z.string() }),
  z.object({ type: z.literal('move'), payload: z.string() }),
])
