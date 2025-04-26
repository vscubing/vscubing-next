'use client'

import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Input,
} from '@/frontend/ui'
import { CheckboxWithLabel } from '@/frontend/ui/checkbox'
import { BaseDialogButton } from '@/frontend/ui/popovers/base-dialog'
import { DISCIPLINES, type Discipline } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
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

export default function CreateCustomContestDialog({
  children,
}: {
  children: ReactNode
}) {
  const {
    register,
    control,
    handleSubmit: hookFormSubmitWrapper,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disciplines: Object.fromEntries(DISCIPLINES.map((d) => [d, true])),
    },
  })

  const handleSubmit = hookFormSubmitWrapper(({ name, disciplines }) => {
    console.log('submitted')
    console.log(name, disciplines)
  })

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent aria-describedby={undefined} asChild className='gap-4'>
          <form onSubmit={handleSubmit}>
            <DialogTitle>New custom contest</DialogTitle>

            <Input placeholder='Contest name' {...register('name')} />
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
              <BaseDialogButton type='submit' version='primary'>
                Create
              </BaseDialogButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
