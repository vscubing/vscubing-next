import { useTwistySimulator } from './use-twisty-simulator'
import { cn } from '@/frontend/utils/cn'
import { useSimulatorTimer } from './use-simulator-timer'
import type { InitSolveData, SimulatorSolveFinishCallback } from './types'
import {
  useMutateSimulatorSettings,
  useSimulatorSettings,
} from '@/app/(app)/settings'

type SimulatorProps = {
  initSolveData: InitSolveData
  onInspectionStart: () => void
  onSolveFinish: SimulatorSolveFinishCallback
}
export default function Simulator({
  initSolveData,
  onSolveFinish,
  onInspectionStart,
}: SimulatorProps) {
  const { data: rawSettings } = useSimulatorSettings()
  const settings = {
    animationDuration: rawSettings?.animationDuration ?? 100, // TODO: defaults don't belong here
    cameraPositionPhi: rawSettings?.cameraPositionPhi ?? 6,
    cameraPositionTheta: rawSettings?.cameraPositionTheta ?? 0,
    inspectionVoiceAlert: rawSettings?.inspectionVoiceAlert ?? 'Male',
    colorscheme: rawSettings?.colorscheme ?? null,
  }
  const { updateSettings } = useMutateSimulatorSettings()

  const {
    touchStartHandler,
    display,
    status,
    containerRef,
    moveHandler,
    hasRevealedScramble,
  } = useSimulatorTimer({
    onSolveFinish,
    onInspectionStart,
    initSolveData,
    inspectionVoiceAlert: settings.inspectionVoiceAlert,
  })

  useTwistySimulator({
    containerRef,
    onMove: moveHandler,
    scramble: hasRevealedScramble ? initSolveData.scramble : undefined,
    discipline: initSolveData.discipline,
    settings,
    setCameraPosition: ({ phi, theta }) => {
      if (
        phi !== rawSettings?.cameraPositionPhi ||
        theta !== rawSettings?.cameraPositionTheta
      ) {
        updateSettings({
          cameraPositionPhi: phi,
          cameraPositionTheta: theta,
        })
      }
    },
  })

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href='https://fonts.googleapis.com/css2?family=M+PLUS+1+Code&display=swap'
        rel='stylesheet'
      />
      <div
        className='relative flex h-full items-center justify-center'
        onTouchStart={touchStartHandler}
      >
        <span
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 text-7xl [font-family:"M_PLUS_1_Code",monospace] md:bottom-4 md:left-1/2 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-0',
          )}
        >
          {display}
        </span>
        {status === 'ready' && (
          <span className='absolute bottom-20 mx-2 flex min-h-20 items-center rounded-[.75rem] bg-black-100 px-10 py-2 text-center font-kanit text-[1.25rem] text-secondary-20 sm:px-4'>
            <span className='hidden touch:inline'>
              Tap on the cube to scramble it and start the preinspection
            </span>
            <span className='touch:hidden'>
              Press space to scramble the cube and start the preinspection
            </span>
          </span>
        )}
        <div
          className='aspect-square h-[60%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem] [&>div]:flex'
          tabIndex={-1}
          ref={containerRef}
        ></div>
      </div>
    </>
  )
}
