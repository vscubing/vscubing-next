"use client";

import resolveConfig from "tailwindcss/resolveConfig";
import rawConfig from "../../../tailwind.config";

const rawTailwindConfig = rawConfig;
export const tailwindConfig = resolveConfig(rawConfig);

export function tw(className: string) {
  // NOTE: a wrapper used to trigger Tailwind LSP completion
  return className;
}

export const isTouchDevice = matchMediaSsrWorkaround("(pointer:coarse)");

export function matchesQuery(name: keyof typeof screens) {
  const data = screens[name];
  if ("raw" in data) {
    return matchMediaSsrWorkaround(data.raw);
  }

  const query: string[] = [];
  if ("min" in data) {
    query.push(`(min-width: ${data.min})`);
  }
  if ("max" in data) {
    query.push(`(max-width: ${data.max})`);
  }
  const queryString = query.join(" and ");

  return matchMediaSsrWorkaround(queryString);
}
type Screen = keyof typeof rawTailwindConfig.theme.screens;
type Query = { min?: string; max?: string } | { raw: string };
const screens: Record<Screen, Query> = rawTailwindConfig.theme.screens;

function matchMediaSsrWorkaround(query: string) {
  return typeof window !== "undefined" && matchMedia(query).matches;
}
