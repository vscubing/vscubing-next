'use client'

import useMediaQuery from './use-media-query'
import { themeColors, themeScreens } from './theme'

export const tailwindConfig = {
  theme: {
    colors: themeColors,
  },
} as const

type Screen = keyof typeof themeScreens

export function tw(className: string) {
  // NOTE: a wrapper used to trigger Tailwind LSP completion
  return className
}

export function useMatchesScreen(name: Screen) {
  return useMediaQuery(getQuery(name))
}

export function getQuery(name: Screen) {
  const data = themeScreens[name]
  if ('raw' in data) {
    return data.raw
  }

  const screenData = data as { min?: string; max?: string }
  const query: string[] = []
  if (screenData.min) {
    query.push(`(min-width: ${screenData.min})`)
  }
  if (screenData.max) {
    query.push(`(max-width: ${screenData.max})`)
  }
  return query.join(' and ')
}
