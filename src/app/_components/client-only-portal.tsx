'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export default function ClientOnlyPortal({
  children,
  selector,
}: {
  children: ReactNode
  selector: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    ref.current = document.querySelector(selector)
    setMounted(true)
  }, [selector])

  return mounted ? createPortal(children, ref.current!) : null
}
