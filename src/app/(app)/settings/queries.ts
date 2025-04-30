import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSimulatorSettings(
  initialData?: RouterOutputs['settings']['simulatorSettings'],
) {
  const trpc = useTRPC()
  const settingsQuery = trpc.settings.simulatorSettings.queryOptions()
  return useQuery({ ...settingsQuery, initialData })
}

export function useSimulatorSettingsMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const settingsQuery = trpc.settings.simulatorSettings.queryOptions()

  return useMutation(
    trpc.settings.setSimulatorSettings.mutationOptions({
      onMutate: async (newSettings) => {
        await queryClient.cancelQueries(settingsQuery)
        const oldSettings = queryClient.getQueryData(settingsQuery.queryKey)
        queryClient.setQueryData(
          settingsQuery.queryKey,
          (old) => old && { ...old, ...newSettings },
        )
        return { oldSettings }
      },
      onError: (_, __, context) => {
        queryClient.setQueryData(settingsQuery.queryKey, context?.oldSettings)
      },
      onSettled: () => {
        void queryClient.invalidateQueries(settingsQuery)
      },
    }),
  )
}
