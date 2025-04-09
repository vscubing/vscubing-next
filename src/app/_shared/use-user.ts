import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutateAsync, ...logoutMutation } = useMutation(
    trpc.user.logout.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(trpc.user.user.queryOptions())
      },
    }),
  )
  return {
    ...logoutMutation,
    logout: async () => {
      await mutateAsync()
      await queryClient.invalidateQueries(trpc.user.user.queryOptions())
      router.refresh()
    },
  }
}

export function useUser() {
  const trpc = useTRPC()
  const { data: user, ...res } = useQuery(trpc.user.user.queryOptions())
  return { ...res, user }
}
