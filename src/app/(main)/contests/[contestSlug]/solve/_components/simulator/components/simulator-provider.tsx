'use client'

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useConditionalBeforeUnload } from '@/app/_utils/useConditionalBeforeUnload'
import {
  type SimulatorSolveFinishCallback,
  type InitSolveData,
  type SimulatorSolve,
} from './simulator/simulator.lazy'
import { AbortPrompt } from './abort-prompt'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  Dialog,
  DialogCloseCross,
  DialogOverlay,
  DialogPortal,
  LoadingSpinner,
} from '@/app/_components/ui'
import {
  KeyMapDialogTrigger,
  KeyMapDialogContent,
} from '@/app/_shared/KeyMapDialog'
import { z } from 'zod'
const Simulator = lazy(() => import('./simulator/simulator.lazy'))

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  // const { data: settings } = useSettings() // TODO:
  const [solveState, setSolveState] = useState<{
    initSolveData: InitSolveData
    solveCallback: SimulatorSolveFinishCallback
    wasInspectionStarted: boolean
  } | null>(null)
  const [isAbortPromptVisible, setIsAbortPromptVisible] = useState(false)

  const initSolve = useCallback(
    (
      initSolveData: InitSolveData,
      solveCallback: SimulatorSolveFinishCallback,
    ) => {
      setSolveState({
        initSolveData,
        solveCallback,
        wasInspectionStarted: false,
      })
    },
    [],
  )

  const handleInspectionStart = useCallback(() => {
    setSolveState((prev) => prev && { ...prev, wasInspectionStarted: true })
  }, [])

  const solveCallback = solveState?.solveCallback
  const handleSolveFinish = useCallback(
    (result: SimulatorSolve) => {
      solveCallback!(result)
      setSolveState(null)
    },
    [solveCallback],
  )

  const shouldDNFOnPageLeave = !!solveState && solveState.wasInspectionStarted
  useConditionalBeforeUnload(shouldDNFOnPageLeave, () =>
    handleSolveFinish({
      result: { isDnf: true, timeMs: null },
      solution: '',
    }),
  )

  const abortOrShowPrompt = useCallback(() => {
    if (solveState!.wasInspectionStarted === false) {
      setSolveState(null)
      return
    }

    setIsAbortPromptVisible(true)
  }, [solveState])

  const confirmAbort = useCallback(() => {
    setIsAbortPromptVisible(false)
    handleSolveFinish({
      result: { isDnf: true, timeMs: null },
      solution: '',
    })
  }, [handleSolveFinish])

  const cancelAbort = useCallback(() => {
    setIsAbortPromptVisible(false)
  }, [])

  const contextValue = useMemo(
    () => ({
      initSolve,
    }),
    [initSolve],
  )

  const isModalOpen = !!solveState
  return (
    <>
      <DialogPrimitive.Root open={isModalOpen}>
        <DialogPrimitive.Portal>
          <div
            className='fixed inset-0 z-50 bg-black-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            onClick={abortOrShowPrompt}
          ></div>

          <DialogPrimitive.Content
            aria-describedby={undefined}
            style={{ pointerEvents: undefined }}
            className='fixed inset-[1.625rem] z-50 rounded-2xl bg-black-80 duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          >
            <DialogPrimitive.Title className='sr-only'>
              Virtual cube simulator
            </DialogPrimitive.Title>
            <div className='relative h-full rounded-2xl'>
              <Suspense
                fallback={
                  <div className='flex h-full items-center justify-center'>
                    <LoadingSpinner />
                  </div>
                }
              >
                {solveState && (
                  <Simulator
                    initSolveData={solveState.initSolveData}
                    onSolveFinish={handleSolveFinish}
                    onInspectionStart={handleInspectionStart}
                    settings={{
                      animationDuration: 100,
                      inspectionVoiceAlert: z
                        .enum(['Male', 'Female', 'None'])
                        .catch('Male')
                        .parse('Male'),
                    }}
                  />
                )}
              </Suspense>
              <div className='absolute left-6 right-6 top-6 flex items-start justify-between'>
                <Dialog>
                  <KeyMapDialogTrigger autoFocus={false} />
                  <DialogPortal>
                    <DialogOverlay
                      className='bg-black-1000/25'
                      withCubes={false}
                    />
                    <KeyMapDialogContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault()
                      }}
                    />
                  </DialogPortal>
                </Dialog>
                <DialogCloseCross onClick={abortOrShowPrompt} />
              </div>

              <AbortPrompt
                isVisible={isAbortPromptVisible}
                onConfirm={confirmAbort}
                onCancel={cancelAbort}
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <SimulatorContext.Provider value={contextValue}>
        {children}
      </SimulatorContext.Provider>
    </>
  )
}

type SimulatorContextValue = {
  initSolve: (
    data: InitSolveData,
    onSolveFinish: SimulatorSolveFinishCallback,
  ) => void
}
export const SimulatorContext = createContext<SimulatorContextValue>({
  initSolve: () => {
    throw new Error('cube context is missing')
  },
})
