import {
  PlayForwardIcon,
  PlayIcon,
  PlaySkipBackIcon,
  PlaySkipForwardIcon,
  PlaybackIcon,
  StopIcon,
} from '@/frontend/ui'
import { BoundaryType, type TwistyPlayer } from '@vscubing/cubing/twisty'
import { cn } from '@/frontend/utils/cn'
import { type HTMLAttributes, useEffect, useState } from 'react'

export function TwistyControls({
  player,
  className,
  size = 'lg',
}: {
  player: TwistyPlayer
  className?: string
  size?: 'lg' | 'sm'
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const updateIsPlaying = (
      buttonAppearances: Record<string, { icon: string }>,
    ) => {
      if (buttonAppearances['play-pause']!.icon === 'play') {
        setIsPlaying(false)
      } else {
        setIsPlaying(true)
      }
    }
    player.experimentalModel.buttonAppearance.addFreshListener(updateIsPlaying)
    return () =>
      player.experimentalModel.buttonAppearance.removeFreshListener(
        updateIsPlaying,
      )
  }, [player])

  function jumpToStart() {
    void player.controller?.jumpToStart({ flash: true })
  }
  function playStepBackwards() {
    void player.controller?.animationController.play({
      direction: -1,
      untilBoundary: BoundaryType.Move,
    })
  }
  function playPause() {
    void player.controller?.togglePlay()
  }
  function playStep() {
    void player.controller?.animationController.play({
      direction: 1,
      untilBoundary: BoundaryType.Move,
    })
  }

  function jumpToEnd() {
    void player.controller?.jumpToEnd({ flash: true })
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between text-white-100',
        className,
      )}
    >
      <ControlButton size={size} onClick={jumpToStart}>
        {CONTROL_ICONS.jumpToStart}
      </ControlButton>
      <ControlButton size={size} onClick={playStepBackwards}>
        {CONTROL_ICONS.playStepBackwards}
      </ControlButton>
      <button
        className={cn(
          'outline-ring transition-base flex items-center justify-center rounded-full bg-primary-60 text-black-100 hover:bg-primary-80 active:bg-primary-60',
          {
            'h-14 w-14': size === 'lg',
            'h-12 w-12 [&>svg]:text-[.9rem]': size === 'sm',
          },
        )}
        onClick={playPause}
        autoFocus
      >
        {isPlaying ? CONTROL_ICONS.pause : CONTROL_ICONS.play}
      </button>
      <ControlButton size={size} onClick={playStep}>
        {CONTROL_ICONS.playStep}
      </ControlButton>
      <ControlButton size={size} onClick={jumpToEnd}>
        {CONTROL_ICONS.jumpToEnd}
      </ControlButton>
    </div>
  )
}

function ControlButton({
  className,
  children,
  size,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { size: 'lg' | 'sm' }) {
  return (
    <button
      {...props}
      className={cn(
        'transition-base outline-ring flex items-center justify-center hover:text-primary-60 active:text-primary-80 sm:h-11 sm:w-11',
        {
          'h-14 w-14 text-[1.5rem]': size === 'lg',
          'h-10 w-10 text-[1rem]': size === 'sm',
        },
        className,
      )}
    >
      {children}
    </button>
  )
}

const CONTROL_ICONS = {
  jumpToStart: <PlaySkipBackIcon />,
  playStepBackwards: <PlaybackIcon />,
  play: <PlayIcon />,
  pause: <StopIcon />,
  playStep: <PlayForwardIcon />,
  jumpToEnd: <PlaySkipForwardIcon />,
} as const
