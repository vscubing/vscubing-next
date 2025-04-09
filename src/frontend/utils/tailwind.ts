'use client'

import resolveConfig from 'tailwindcss/resolveConfig'
import rawConfig from '../../../tailwind.config'
import useMediaQuery from './use-media-query'

const rawTailwindConfig = rawConfig
export const tailwindConfig = resolveConfig(rawConfig)

export function tw(className: string) {
  // NOTE: a wrapper used to trigger Tailwind LSP completion
  return className
}

export function useMatchesScreen(name: keyof typeof screens) {
  return useMediaQuery(getQuery(name))
}

export function getQuery(name: keyof typeof screens) {
  const data = screens[name]
  if ('raw' in data) {
    return data.raw
  }

  const query: string[] = []
  if ('min' in data) {
    query.push(`(min-width: ${data.min})`)
  }
  if ('max' in data) {
    query.push(`(max-width: ${data.max})`)
  }
  return query.join(' and ')
}

type Screen = keyof typeof rawTailwindConfig.theme.screens
type Query = { min?: string; max?: string } | { raw: string }
const screens: Record<Screen, Query> = rawTailwindConfig.theme.screens
