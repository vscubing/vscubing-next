import { SolvePanel } from './solve-panel'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  PrimaryButton,
  SecondaryButton,
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogCloseCross,
  DialogTitle,
  DialogDescription,
  TextArea,
  DialogFooter,
  DialogClose,
} from '@/frontend/ui'
import { BaseDialogButton } from '@/frontend/ui/popovers/base-dialog'
import type { ScramblePosition, ResultDnfish, Discipline } from '@/types'

export function CurrentSolve({
  areActionsDisabled,
  number,
  canChangeToExtra,
  position,
  result,
  solveId,
  scramble,
  isPersonalBest,
  onChangeToExtra,
  onSolveInit,
  onSolveSubmit,
  contestSlug,
  discipline,
}: {
  areActionsDisabled: boolean
  number: number
  canChangeToExtra: boolean
  scramble: string
  position: ScramblePosition
  result: ResultDnfish | null
  isPersonalBest: boolean
  solveId: number | null
  onChangeToExtra: (reason: string) => void
  onSolveInit: () => void
  onSolveSubmit: () => void
  contestSlug: string
  discipline: Discipline
}) {
  return (
    <SolvePanel
      contestSlug={contestSlug}
      discipline={discipline}
      number={number}
      scramble={scramble}
      position={position}
      result={result}
      isPersonalBest={isPersonalBest}
      solveId={solveId}
      renderAction={
        <SolveAction
          result={result}
          disabled={areActionsDisabled}
          onSolveSubmit={onSolveSubmit}
          onSolveInit={onSolveInit}
          onChangeToExtra={onChangeToExtra}
          canChangeToExtra={canChangeToExtra}
        />
      }
    />
  )
}

function SolveAction({
  result,
  disabled,
  canChangeToExtra,
  onSolveInit,
  onChangeToExtra,
  onSolveSubmit,
}: {
  disabled: boolean
  result: ResultDnfish | null
  canChangeToExtra: boolean
  onSolveInit: () => void
  onSolveSubmit: () => void
  onChangeToExtra: (reason: string) => void
}) {
  if (result === null)
    return (
      <PrimaryButton
        size='sm'
        onClick={onSolveInit}
        disabled={disabled}
        autoFocus
      >
        Solve
      </PrimaryButton>
    )

  return (
    <div className='flex gap-1'>
      {canChangeToExtra && (
        <ExtraReasonPrompt
          onChangeToExtra={onChangeToExtra}
          renderTrigger={
            <SecondaryButton
              size='sm'
              className='w-[5.25rem]'
              disabled={disabled}
            >
              Extra
            </SecondaryButton>
          }
        />
      )}
      <PrimaryButton
        size='sm'
        className='w-[5.25rem]'
        onClick={onSolveSubmit}
        disabled={disabled}
        autoFocus
      >
        Submit
      </PrimaryButton>
    </div>
  )
}

const REASON_MIN_LENGTH = 3
const reasonFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(REASON_MIN_LENGTH, 'The reason should be at least 3 characters long'),
})
type ReasonForm = z.infer<typeof reasonFormSchema>

function ExtraReasonPrompt({
  renderTrigger,
  onChangeToExtra,
}: {
  renderTrigger: ReactNode
  onChangeToExtra: (reason: string) => void
}) {
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ReasonForm>({ resolver: zodResolver(reasonFormSchema) })

  const [open, setOpen] = useState(false)

  function onSubmit({ reason }: ReasonForm) {
    onChangeToExtra(reason)
    setOpen(false)
  }

  return (
    <Dialog
      onOpenChange={(newOpen) => {
        resetForm()
        setOpen(newOpen)
      }}
      open={open}
    >
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay withCubes={false} className='bg-black-1000/25' />
        <DialogContent className='max-w-[35rem] p-0 sm:py-4'>
          <form
            className='relative h-full w-full px-24 py-16 md:px-12 md:py-12 sm:px-2 sm:py-4'
            onSubmit={handleSubmit(onSubmit)}
          >
            <DialogCloseCross className='absolute right-4 top-4 md:right-2 md:top-2 md:h-11 md:w-11 sm:-right-1 sm:-top-1' />
            <DialogTitle className='mb-4'>Need an Extra attempt?</DialogTitle>
            <DialogDescription className='mb-8 text-center text-[0.875rem] leading-[1.5] text-grey-20 sm:mb-4'>
              To request an extra attempt, please tell us what went wrong. This
              helps ensure extras are used thoughtfully
            </DialogDescription>
            <label className='mb-8 block md:mb-4'>
              <TextArea
                error={!!errors.reason}
                {...register('reason')}
                className='mb-1 h-24 w-full'
                placeholder='Type your reason here'
              />
              <span className='caption'>{errors.reason?.message}</span>
            </label>
            <DialogFooter>
              <DialogClose version='secondary'>Cancel</DialogClose>
              <BaseDialogButton
                type='submit'
                version='primary'
                disabled={!!errors.reason}
              >
                Submit
              </BaseDialogButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
