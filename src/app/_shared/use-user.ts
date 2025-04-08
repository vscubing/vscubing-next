import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery } from '@tanstack/react-query'

export function useLogout() {
  const trpc = useTRPC()
  const mutation = useMutation(trpc.user.logout.mutationOptions())
  return {
    ...mutation,
    logoutAsync: mutation.mutateAsync,
    logout: mutation.mutate,
  }
}

export function useUser() {
  const trpc = useTRPC()
  const res = useQuery(trpc.user.user.queryOptions())
  return { ...res, user: res.data }
}
