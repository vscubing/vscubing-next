'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Input,
  toast,
  TOASTS_PRESETS,
} from '@/frontend/ui'
import { CheckboxWithLabel } from '@/frontend/ui/checkbox'
import { BaseDialogButton } from '@/frontend/ui/popovers/base-dialog'
import { useTRPC } from '@/trpc/react'
import { assertDiscipline, DISCIPLINES, type Discipline } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string(),
  disciplines: z.object(
    Object.fromEntries(
      DISCIPLINES.map((discipline) => [discipline, z.boolean()]),
    ) as Record<Discipline, ReturnType<typeof z.boolean>>,
  ),
})
type FormSchema = z.infer<typeof formSchema>

export function SpecialContestCreationDialog({
  children,
}: {
  children: ReactNode
}) {
  const {
    register,
    control,
    setError,
    formState: { errors },
    handleSubmit: hookFormSubmitWrapper,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disciplines: Object.fromEntries(DISCIPLINES.map((d) => [d, true])),
    },
  })

  const router = useRouter()
  const trpc = useTRPC()
  const { mutateAsync: createSpecial, isPending: isCreationPending } =
    useMutation(trpc.specialContest.create.mutationOptions())

  const handleSubmit = hookFormSubmitWrapper(async (contest) => {
    const disciplines = Object.entries(contest.disciplines)
      .filter(([, selected]) => selected)
      .map(([discipline]) => assertDiscipline(discipline))
    const { data, error } = await createSpecial({
      disciplines,
      name: contest.name,
    })
    if (error === 'CONFLICT') {
      setError('name', { message: 'Contest name already exists' })
      return
    }
    if (error || !data) {
      toast(TOASTS_PRESETS.internalError)
      return
    }

    void router.push(`/contests/${data.newContestSlug}`)
  })

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent aria-describedby={undefined} asChild className='gap-4'>
          <form onSubmit={handleSubmit}>
            <DialogTitle>New special contest</DialogTitle>

            <Input placeholder='Contest name' {...register('name')} />
            {errors.name && <span>{errors.name?.message}</span>}
            <ul>
              {DISCIPLINES.map((discipline) => (
                <li key={discipline}>
                  <Controller
                    control={control}
                    name={`disciplines.${discipline}`}
                    render={({ field: { onChange, value } }) => (
                      <CheckboxWithLabel // TODO: discipline badge checkbox
                        label={discipline}
                        onCheckedChange={onChange}
                        checked={value}
                      />
                    )}
                  />
                </li>
              ))}
            </ul>

            <DialogFooter className='sm:grid sm:grid-cols-2'>
              <DialogClose version='secondary'>Cancel</DialogClose>
              <BaseDialogButton
                type='submit'
                version='primary'
                disabled={isCreationPending}
              >
                Create
              </BaseDialogButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
