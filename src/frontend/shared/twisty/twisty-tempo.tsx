import { useEffect, useRef, useState } from 'react'
import { type TwistyPlayer as Player } from '@vscubing/cubing/twisty'
import { cn } from '@/frontend/utils/cn'
import { handleSliderStylesOnChange, sliderStyles } from './slider-styles'

export function TwistyTempo({
  className,
  twistyPlayer,
}: {
  className?: string
  twistyPlayer: Player
}) {
  const [tempo, setTempo] = useState(1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const input = inputRef.current
    if (input) {
      handleSliderStylesOnChange(input, tempo.toString())
      // eslint-disable-next-line react-hooks/immutability
      twistyPlayer.tempoScale = tempo
      // @ts-expect-error I know what I'm doing
      if (twistyPlayer.experimentalModel.__vscubingAnimationTimelineLeavesSet) {
        twistyPlayer.tempoScale = tempo
      } else {
        twistyPlayer.tempoScale = tempo * 4
      }
    }
  }, [tempo, twistyPlayer])

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <style /* we'll remove this crunch either if we have another use-case for the input-range slider (and make a proper custom component)
       * or if we decide to build a custom TwistySlider */
      >
        {sliderStyles}
      </style>
      <input
        ref={inputRef}
        onChange={(e) => setTempo(parseFloat(e.target.value))}
        className='flex-1 cursor-pointer bg-transparent'
        type='range'
        min='0.1'
        max='6'
        step='0.1'
        value={tempo}
      />
      <span className='title-h3 w-14 text-center'>({tempo}x)</span>
    </div>
  )
}
