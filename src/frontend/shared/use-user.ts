import { useTRPC } from '@/lib/trpc/react'
import { useMutation, useQuery } from '@tanstack/react-query'

export function useUser() {
  const trpc = useTRPC()
  const { data: user, ...res } = useQuery(trpc.user.me.queryOptions())
  return { ...res, user }
}

export function useLogout() {
  const trpc = useTRPC()
  const { mutateAsync, ...mutation } = useMutation(
    trpc.user.logout.mutationOptions({
      onSettled: () => location.reload(),
    }),
  )
  return {
    ...mutation,
    logout: () => mutateAsync(),
  }
}

export function useRemoveWcaAccount() {
  const trpc = useTRPC()
  const { mutateAsync, ...mutation } = useMutation(
    trpc.user.removeWcaAccount.mutationOptions({
      onSettled: () => location.reload(),
    }),
  )
  return {
    ...mutation,
    removeWcaAccount: () => mutateAsync(),
  }
}
