'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '@/app/_components/ui'
import { useForm } from 'react-hook-form'
import { Input } from '@/app/_components/ui'
import { useTRPC } from '@/trpc/react'
import { useMutation } from '@tanstack/react-query'
import { useLogout, useUser } from '@/app/_shared/use-user'

export function PickUsernameDialog() {
  const { user, isLoading: isUserLoading } = useUser()

  const isVisible = user?.finishedRegistration === false

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ username: string }>()

  const trpc = useTRPC()
  const { logout } = useLogout()
  const { isPending: isMutationPending, mutate } = useMutation(
    trpc.user.setUsername.mutationOptions(),
  )

  const isPending = isMutationPending || isUserLoading

  async function onSubmit({ username }: { username: string }) {
    mutate(
      { username },
      {
        onSuccess: () => {
          location.reload()
        },
        onError: (error) => {
          if (error.data?.zodError) {
            setError('username', {
              message: error.data?.zodError.fieldErrors?.username?.[0],
            })
          } else {
            setError('username', { message: error.message })
          }
        },
      },
    )
  }

  return (
    <AlertDialog open={isVisible}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent asChild>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <AlertDialogTitle className='mb-4'>
                Greetings, Speedcuber
              </AlertDialogTitle>
              <AlertDialogDescription className='text-center text-grey-20'>
                Just a quick nickname needed to personalize your experience.
              </AlertDialogDescription>
            </div>
            <label className='flex w-min max-w-full flex-col gap-1 sm:w-full'>
              <Input
                placeholder='Enter your nickname'
                className='block w-[20rem] max-w-full sm:w-full'
                error={!!errors.username}
                type='text'
                maxLength={24}
                {...register('username')}
              />
              <span className='caption'>{errors.username?.message}</span>
            </label>
            <AlertDialogFooter className='sm:grid sm:grid-cols-2'>
              <AlertDialogCancel onClick={() => logout()} type='button'>
                Log out
              </AlertDialogCancel>
              <AlertDialogAction
                type='submit'
                disabled={!!errors.username || isPending}
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
