'use client'

import { cn } from '@/app/_utils/cn'
import {
  createContext,
  type ReactNode,
  useRef,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
  useCallback,
  use,
} from 'react'
import { type BlockType } from '.'

const INTERVAL_BETWEEN_ANIMATIONS = 1000

type AnimationContextType = {
  canRun: Record<BlockType, boolean>
  blocksRef: BlocksRef
  onAnimationEnd: (block: BlockType) => void
}

const AnimationContext = createContext<AnimationContextType | null>(null)

type BlocksRef = Map<BlockType, Element | null>
export function AnimationsController({ children }: { children: ReactNode }) {
  const blocksRef = useRef<BlocksRef>(new Map())
  const [canRun, setCanRun] = useState<AnimationContextType['canRun']>({
    results: false,
    scrambles: false,
    leaderboards: false,
    sharing: false,
  })
  const [queue, setQueue] = useState<BlockType[]>([
    'results',
    'scrambles',
    'leaderboards',
    'sharing',
  ])

  useEffect(() => {
    if (queue.length === 0) return
    const currentBlock = queue[0]!
    const currentBlockNode = blocksRef.current.get(currentBlock)
    if (!currentBlockNode) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry!.isIntersecting
        if (isIntersecting) setCanRun({ ...canRun, [currentBlock]: true })
      },
      {
        rootMargin: '-72px 0px 0px',
        threshold: 0,
      },
    )

    observer.observe(currentBlockNode)
    return () => observer.unobserve(currentBlockNode)
  }, [queue, canRun])

  const onAnimationEnd = useCallback(
    (block: BlockType) =>
      setTimeout(
        () =>
          setQueue((prev) => {
            const currentBlock = prev[0]
            return currentBlock === block ? prev.slice(1) : prev
          }),
        INTERVAL_BETWEEN_ANIMATIONS,
      ),
    [setQueue],
  )

  return (
    <AnimationContext.Provider
      value={{ canRun, onAnimationEnd, blocksRef: blocksRef.current }}
    >
      {children}
    </AnimationContext.Provider>
  )
}

function useAnimationContext() {
  const context = use(AnimationContext)
  if (!context) {
    throw new Error('animation context is missing')
  }
  return context
}

export function BlockIntersectionWrapper({
  children,
  block,
}: {
  children: ReactNode
  block: BlockType
}) {
  const { blocksRef } = use(AnimationContext)!

  function handleBlockRef(node: Element | null) {
    if (node) {
      blocksRef.set(block, node)
    } else {
      blocksRef.delete(block)
    }
  }

  return <div ref={handleBlockRef}>{children}</div>
}

export function AnimationItem({
  className,
  block,
  children,
  shouldRegisterAnimationEnd = true,
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  block: BlockType
  shouldRegisterAnimationEnd?: boolean
}) {
  const { ref } = useRegisterAnimationEnd(block, shouldRegisterAnimationEnd)
  const { canRun } = useAnimationContext()

  return (
    <div
      className={cn({ paused: !canRun[block] }, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
}

function useRegisterAnimationEnd(block: BlockType, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const { onAnimationEnd } = useAnimationContext()

  useEffect(() => {
    const node = ref.current
    if (!node || !enabled) {
      return
    }
    const callback = () => onAnimationEnd(block)
    node.addEventListener('animationend', callback)
    return () => node.removeEventListener('animationend', callback)
  }, [ref, block, enabled, onAnimationEnd])

  return { ref }
}
