import { TwistyAlgViewer as AlgViewer, type TwistyPlayer as Player } from '@vscubing/cubing/twisty'
import { useRef, useEffect } from 'react'

interface TwistyAlgViewerProps {
  twistyPlayer: Player
  className?: string
}
export const TwistyAlgViewer = ({ className, twistyPlayer }: TwistyAlgViewerProps) => {
  const spanRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const algViewer = new AlgViewer({ twistyPlayer })
    spanRef.current?.appendChild(algViewer)

    return () => algViewer.remove()
  }, [className, twistyPlayer])

  return <span className={className} ref={spanRef} />
}
