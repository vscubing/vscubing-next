"use client";

import { useEffect, useState } from "react";

export default function useMediaQuery(mediaQuery: string) {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    const abortSignal = new AbortController();
    mediaQueryList.addEventListener("change", handleChange, abortSignal);

    return () => abortSignal.abort();
  }, [mediaQuery]);

  return matches;
}

export function useIsTouchDevice() {
  return useMediaQuery("(pointer:coarse)");
}
