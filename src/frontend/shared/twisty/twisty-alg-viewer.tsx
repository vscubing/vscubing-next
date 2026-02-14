import {
  TwistyAlgViewer as AlgViewer,
  type ExperimentalLeafIndex,
  type TwistyPlayer as Player,
} from '@vscubing/cubing/twisty'
import { useRef, useEffect } from 'react'

interface TwistyAlgViewerProps {
  twistyPlayer: Player
  startIndex?: ExperimentalLeafIndex
  className?: string
}
export const TwistyAlgViewer = ({
  className,
  startIndex = 0 as ExperimentalLeafIndex,
  twistyPlayer,
}: TwistyAlgViewerProps) => {
  const spanRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const algViewer = new AlgViewer({ twistyPlayer })
    spanRef.current?.appendChild(algViewer)
    void algViewer.jumpToIndex(startIndex, false)

    return () => algViewer.remove()
  }, [twistyPlayer, startIndex])

  return <span className={className} ref={spanRef} />
}
