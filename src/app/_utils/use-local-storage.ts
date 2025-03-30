import { useCallback, useSyncExternalStore } from 'react'

export function useLocalStorage<T>(key: string, initialValue?: T) {
  const data = useSyncExternalStore<T>(
    (onChange) => {
      const onStorageEvent = (e: Event) => {
        const customEvent = e as CustomEvent
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (customEvent.detail.key === key) {
          onChange()
        }
      }
      window.addEventListener('storage', onChange)
      window.addEventListener(
        'local-storage-change',
        onStorageEvent as EventListener,
      )
      return () => {
        window.removeEventListener('storage', onChange)
        window.removeEventListener(
          'local-storage-change',
          onStorageEvent as EventListener,
        )
      }
    },
    // @ts-expect-error w/e
    () => {
      const data = localStorage.getItem(key)
      return data ? (JSON.parse(data) as T) : initialValue
    },
    () => initialValue,
  )

  const setData = useCallback(
    (value: T) => {
      localStorage.setItem(key, JSON.stringify(value))
      window.dispatchEvent(
        new CustomEvent('local-storage-change', { detail: { key } }),
      )
    },
    [key],
  )

  return [data, setData] as const
}
