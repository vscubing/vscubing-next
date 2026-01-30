import {
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
import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const REASON_MIN_LENGTH = 3
const reasonFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(REASON_MIN_LENGTH, 'The reason should be at least 3 characters long'),
})
type ReasonForm = z.infer<typeof reasonFormSchema>

export function ExtraPrompt({
  trigger,
  onSubmit,
}: {
  trigger: ReactNode
  onSubmit: (reason: string) => void
}) {
  const {
    register,
    handleSubmit: hookFormSubmitWrapper,
    reset: resetForm,
    formState: { errors },
  } = useForm<ReasonForm>({ resolver: zodResolver(reasonFormSchema) })

  const [open, setOpen] = useState(false)

  const handleSubmit = hookFormSubmitWrapper(({ reason }) => {
    onSubmit(reason)
    setOpen(false)
  })

  return (
    <Dialog
      onOpenChange={(newOpen) => {
        resetForm()
        setOpen(newOpen)
      }}
      open={open}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay withCubes={false} className='bg-black-1000/25' />
        <DialogContent className='max-w-[35rem] gap-8 p-0 sm:gap-6 sm:py-4'>
          <form
            className='relative h-full w-full px-24 py-16 md:px-12 md:py-12 sm:px-2 sm:py-4'
            onSubmit={handleSubmit}
          >
            <DialogCloseCross className='absolute right-4 top-4 md:right-2 md:top-2 md:h-11 md:w-11 sm:-right-1 sm:-top-1' />
            <DialogTitle className='mb-4'>Need an Extra attempt?</DialogTitle>
            <DialogDescription className='mb-8 text-center text-[0.875rem] leading-[1.5] text-grey-20 sm:mb-4'>
              To request an extra attempt, please tell us what went wrong. This
              helps ensure extras are used thoughtfully.
            </DialogDescription>
            <label className='mb-8 block md:mb-4'>
              <TextArea
                error={!!errors.reason}
                {...register('reason')}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter')
                    void handleSubmit()
                }}
                autoFocus
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
