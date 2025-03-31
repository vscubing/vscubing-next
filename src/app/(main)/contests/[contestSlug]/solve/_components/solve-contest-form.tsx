'use client'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'

export function SolveContestForm({ contestSlug }: { contestSlug: string }) {
  const currentSolve = {
    canChangeToExtra: true,
    scramble: {
      id: 1,
      isExtra: false,
      moves: 'R U',
      position: '1',
    },
    solve: null,
  }

  // const { initSolve } = useCube()
  // TODO: useCube

  // TODO: discord invite

  function handleInitSolve() {
    // const onSolveFinish = async (result: CubeSolveResult) => {
    //   await postSolveResult({ scrambleId: currentSolve.scramble.id, result })
    // }
    //
    // initSolve(
    //   { scramble: currentSolve.scramble.moves, discipline },
    //   (result) => void onSolveFinish(result),
    // )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submittedSolveSet: any[] = []
  async function handleSolveAction(
    payload: { type: 'change_to_extra'; reason: string } | { type: 'submit' },
  ) {
    // await solveAction(payload)
    //
    // if (
    //   submittedSolveSet?.length === 4 &&
    //   payload.type === 'submit' &&
    //   !seenDiscordInvite
    // ) {
    //   toast({
    //     title: 'Great to have you on board',
    //     description:
    //       'Join our Discord community to connect with other cubing fans',
    //     contactUsButton: true,
    //     contactUsButtonLabel: 'Join us on Discord',
    //     duration: 'infinite',
    //     className: 'w-[23.75rem]',
    //   })
    //   setSeenDiscordInvite(true)
    // }
  }

  const currentSolveNumber = (submittedSolveSet?.length ?? 0) + 1
  return (
    <div className='flex flex-1 justify-center pl-16 pr-12'>
      <div className='flex max-w-[64rem] flex-1 flex-col'>
        <div className='mb-1 flex gap-8 pl-[calc(0.25rem*12+3.7rem)] xl-short:pl-[calc(0.25rem*6+3.7rem)]'>
          <span className='w-16 text-center text-grey-40'>Attempt</span>
          <span className='w-24 text-center text-grey-40'>Single time</span>
          <span className='text-grey-40'>Scramble</span>
        </div>
        <div className='scrollbar flex flex-1 basis-0 items-start justify-center gap-12 overflow-y-auto pr-4 xl-short:gap-6'>
          <Progress
            className='gap-12 xl-short:gap-6'
            currentSolveNumber={currentSolveNumber}
          />
          <div className='flex w-full flex-1 flex-col gap-12 xl-short:gap-6'>
            {submittedSolveSet?.map(({ solve }, index) => (
              <SolvePanel
                contestSlug={contestSlug}
                number={index + 1}
                timeMs={solve.timeMs}
                isDnf={solve.isDnf}
                scramble={solve.scramble}
                id={solve.id}
                key={solve.id}
              />
            ))}

            <CurrentSolve
              contestSlug={contestSlug}
              areActionsDisabled={false} // TODO:
              currentSolve={currentSolve}
              onChangeToExtra={(reason) =>
                handleSolveAction({ type: 'change_to_extra', reason })
              }
              onSolveInit={handleInitSolve}
              onSolveSubmit={() => handleSolveAction({ type: 'submit' })}
              number={currentSolveNumber}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
