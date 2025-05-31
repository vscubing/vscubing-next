'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useRemoveSearchParam() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const removeSearchParam = useCallback(
    (param: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(param)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  return { removeSearchParam }
}
