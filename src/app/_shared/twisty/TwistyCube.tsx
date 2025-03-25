import { cn } from '@/app/_utils/cn'
import {
  type TwistyPlayer as Player,
  type TwistyPlayerConfig,
} from '@vscubing/cubing/twisty'
import { useRef, useEffect } from 'react'

interface TwistyCubeProps extends TwistyPlayerConfig {
  className?: string
  player: Player
}
export const TwistyCube = ({ className, player }: TwistyCubeProps) => {
  const spanRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    spanRef.current?.appendChild(player)
    return () => player.remove()
  }, [className, player])

  return (
    <div
      className={cn(
        '[&>twisty-player]:h-full [&>twisty-player]:w-full',
        className,
      )}
      ref={spanRef}
    ></div>
  )
}
