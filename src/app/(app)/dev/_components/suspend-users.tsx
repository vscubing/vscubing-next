'use client'

import { Input, PrimaryButton, SecondaryButton } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { useTRPC } from '@/lib/trpc/react'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

export function SuspendUsers() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const suspendedUsersQuery = trpc.admin.getSuspendedUsers.queryOptions()
  const { data: suspendedUsers, isLoading } = useQuery(suspendedUsersQuery)

  const { mutateAsync: unsuspendUser } = useMutation(
    trpc.admin.unsuspendUser.mutationOptions(),
  )

  async function handleUnsuspend(userId: string) {
    await unsuspendUser({ userId })
    await queryClient.invalidateQueries({
      queryKey: suspendedUsersQuery.queryKey,
    })
  }

  return (
    <section className='space-y-4'>
      <h2 className='title-h2'>Suspended users</h2>
      <SuspendUserForm
        onSuspended={() =>
          queryClient.invalidateQueries({
            queryKey: suspendedUsersQuery.queryKey,
          })
        }
      />
      {isLoading ? (
        <LoadingDots />
      ) : !suspendedUsers?.length ? (
        <p className='text-grey-40'>No suspended users</p>
      ) : (
        <ul className='space-y-2'>
          {suspendedUsers.map((user) => (
            <li key={user.userId} className='flex items-center gap-3'>
              <span>{user.username ?? user.userId}</span>
              <SecondaryButton
                size='sm'
                onClick={() => handleUnsuspend(user.userId)}
              >
                Unsuspend
              </SecondaryButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SuspendUserForm({ onSuspended }: { onSuspended: () => void }) {
  const { register, handleSubmit, reset, setError, formState } = useForm<{
    username: string
  }>()
  const trpc = useTRPC()
  const { mutateAsync: suspendUser, isPending } = useMutation(
    trpc.admin.suspendUser.mutationOptions(),
  )

  async function onSubmit({ username }: { username: string }) {
    const { error } = await tryCatchTRPC(suspendUser({ username }))
    if (error) {
      setError('username', { message: error.message })
      return
    }
    reset()
    onSuspended()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex max-w-[24rem] flex-col gap-2'
    >
      <Input
        placeholder='Username to suspend'
        required
        {...register('username')}
      />
      <span className='caption text-red-80'>
        {formState.errors.username?.message}
      </span>
      <PrimaryButton disabled={isPending} type='submit' size='sm'>
        Suspend
      </PrimaryButton>
    </form>
  )
}
