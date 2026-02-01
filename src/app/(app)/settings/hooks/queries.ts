import { toast, TOASTS_PRESETS } from '@/frontend/ui'
import { type RouterOutputs, useTRPC } from '@/lib/trpc/react'
import type { SimulatorSettings } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSimulatorSettings(
  initialData?: RouterOutputs['settings']['simulatorSettings'],
) {
  const trpc = useTRPC()
  const settingsQuery = trpc.settings.simulatorSettings.queryOptions()
  return useQuery({ ...settingsQuery, initialData })
}

// NOTE: settings are updated locally immediately, but the mutation request to server is debounced
export function useMutateSimulatorSettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const settingsQuery = trpc.settings.simulatorSettings.queryOptions()

  const { mutateAsync } = useMutation(
    trpc.settings.setSimulatorSettings.mutationOptions(),
  )

  function handleMutation(newSettings: Partial<SimulatorSettings>) {
    void queryClient.cancelQueries(settingsQuery)
    const oldSettings = queryClient.getQueryData(settingsQuery.queryKey)
    queryClient.setQueryData(
      settingsQuery.queryKey,
      (old) => old && { ...old, ...newSettings },
    )

    debounceSettings(async () => {
      try {
        await mutateAsync({ ...oldSettings, ...newSettings }) // NOTE: we have to merge oldSettings with newSettings so taht cameraPosition and puzzleSize changes don't override each other in a race condition
      } catch {
        queryClient.setQueryData(settingsQuery.queryKey, oldSettings)
        toast(TOASTS_PRESETS.internalError)
      }
    }, 500)
  }

  return { updateSettings: handleMutation }
}

let timeoutId: number | undefined
function debounceSettings(fn: () => unknown, ms: number) {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(fn, ms) as unknown as number
}
