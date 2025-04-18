import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useUser() {
  const trpc = useTRPC()
  const { data: user, ...res } = useQuery(trpc.user.me.queryOptions())
  return { ...res, user }
}

export function useLogout() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutateAsync, ...mutation } = useMutation(
    trpc.user.logout.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(trpc.user.me.queryOptions())
      },
    }),
  )
  return {
    ...mutation,
    logout: async () => {
      await mutateAsync()
      await queryClient.invalidateQueries(trpc.user.me.queryOptions())
      location.reload()
    },
  }
}

export function useRemoveWcaAccount() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutateAsync, ...mutation } = useMutation(
    trpc.user.removeWcaAccount.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(trpc.user.me.queryOptions())
      },
    }),
  )
  return {
    ...mutation,
    removeWcaAccount: async () => {
      await mutateAsync()
      await queryClient.invalidateQueries(trpc.user.me.queryOptions())
    },
  }
}
