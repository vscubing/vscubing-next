import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import type { Discipline } from '@/types'
import { keyToMove, Move, type QuantumMove } from '@vscubing/cubing/alg'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { puzzles } from '@vscubing/cubing/puzzles'
import {
  TwistyPlayer,
  type PuzzleID,
  type TwistyPlayerConfig,
} from '@vscubing/cubing/twisty'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import {
  useSimulatorSettings,
  useMutateSimulatorSettings,
} from './use-simulator-settings'
import { cube3x3x3KeyMapping } from '@/app/(app)/cube-together/[roomId]/page'

const CAMERA_POSITION_DEFAULTS = { phi: 6, theta: 0 } as const
const CSTIMER_DEGREES_PER_STEP = 360 / 52
const CAMERA_DISTANCE_DEFAULT = 4.5

type CameraPosition = Partial<{
  latitude: number
  longitude: number
  distance: number
}>

export function useControllableSimulator({
  discipline,
  scramble,
  pattern,
  colorscheme,
  cameraPosition,
}: {
  discipline: Discipline
  scramble?: string
  pattern?: KPattern
  colorscheme?: TwistyPlayerConfig['colorScheme']
  cameraPosition?: CameraPosition
}) {
  const { data: settings } = useSimulatorSettings()
  const { updateSettings } = useMutateSimulatorSettings()

  const simulatorRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<TwistyPlayer | null>(null)
  const [player, setPlayer] = useState<TwistyPlayer | null>(null)

  const puzzleId = PUZZLE_ID_MAP[discipline]
  const puzzleLoader = useMemo(() => puzzles[puzzleId], [puzzleId])

  const settingsCameraPosition = useMemo(
    () => ({
      phi: settings?.cameraPositionPhi ?? CAMERA_POSITION_DEFAULTS.phi,
      theta: settings?.cameraPositionTheta ?? CAMERA_POSITION_DEFAULTS.theta,
    }),
    [settings?.cameraPositionPhi, settings?.cameraPositionTheta],
  )

  const resolvedCameraPosition = useMemo(() => {
    const fromSettings = {
      latitude: settingsCameraPosition.phi * CSTIMER_DEGREES_PER_STEP,
      longitude: settingsCameraPosition.theta * CSTIMER_DEGREES_PER_STEP,
      distance: CAMERA_DISTANCE_DEFAULT,
    }
    if (!cameraPosition) return fromSettings
    return {
      latitude: cameraPosition.latitude ?? fromSettings.latitude,
      longitude: cameraPosition.longitude ?? fromSettings.longitude,
      distance: cameraPosition.distance ?? fromSettings.distance,
    }
  }, [cameraPosition, settingsCameraPosition])

  useEventListener('keydown', (e) => {
    if (cameraPosition) return
    switch (e.code) {
      case 'ArrowLeft':
        moveCameraDelta(1, 0)
        break
      case 'ArrowUp':
        moveCameraDelta(0, 1)
        break
      case 'ArrowRight':
        moveCameraDelta(-1, 0)
        break
      case 'ArrowDown':
        moveCameraDelta(0, -1)
        break
    }

    function moveCameraDelta(deltaTheta: number, deltaPhi: number) {
      let theta = settingsCameraPosition.theta + deltaTheta
      theta = Math.max(Math.min(theta, 6), -6)
      let phi = settingsCameraPosition.phi + deltaPhi
      phi = Math.max(Math.min(phi, 6), -6)
      updateSettings({ cameraPositionPhi: phi, cameraPositionTheta: theta })
    }
  })

  const isTouchDevice = useIsTouchDevice()
  useEffect(() => {
    const simulatorElem = simulatorRef.current
    if (!simulatorElem) return

    const newPlayer = new TwistyPlayer({
      puzzle: puzzleId,
      controlPanel: 'none',
      background: 'none',
      visualization: 'PG3D',
      // hintFacelets: 'none',
      experimentalStickering: '',
      viewerLink: 'none',
      experimentalDragInput: isTouchDevice ? 'auto' : 'none',
    })
    newPlayer.alg = ''
    newPlayer.experimentalSetupAnchor = 'start'
    newPlayer.clientHeight
    newPlayer.experimentalModel.setupTransformation.set(null)
    newPlayer.experimentalSetupAlg = scramble ?? ''
    newPlayer.cameraLatitudeLimit = Infinity

    if (pattern) {
      const transformation = pattern.experimentalToTransformation()
      if (!transformation) {
        console.error(
          '[SIMULATOR] unable to convert pattern to transformation',
          pattern,
        )
      } else {
        newPlayer.experimentalSetupAlg = ''
        newPlayer.experimentalModel.setupTransformation.set(transformation)
      }
    }

    simulatorElem.innerHTML = ''
    simulatorElem.appendChild(newPlayer)
    playerRef.current = newPlayer
    setPlayer(newPlayer)

    return () => {
      newPlayer.remove()
      if (playerRef.current === newPlayer) {
        playerRef.current = null
      }
      setPlayer(null)
    }
  }, [discipline, scramble, pattern, puzzleId, isTouchDevice])

  useEffect(() => {
    const current = playerRef.current
    if (!current || !resolvedCameraPosition) return
    current.cameraLatitude = resolvedCameraPosition.latitude
    current.cameraLongitude = resolvedCameraPosition.longitude
    current.cameraLatitudeLimit = Infinity
    if (resolvedCameraPosition.distance !== undefined) {
      current.cameraDistance = resolvedCameraPosition.distance
    }
  }, [resolvedCameraPosition])

  useEffect(() => {
    if (!colorscheme) return
    if (playerRef.current) {
      playerRef.current.colorScheme = colorscheme
    }
  }, [colorscheme])

  const applyMove = useEventCallback((move: QuantumMove | string) => {
    const current = playerRef.current
    if (!current) return
    const moveLeaf =
      typeof move === 'string' ? Move.fromString(move) : new Move(move)
    current.experimentalAddAlgLeaf(moveLeaf, {
      cancel: {
        directional: 'none',
        puzzleSpecificModWrap: 'gravity',
      },
      puzzleSpecificSimplifyOptions:
        puzzleLoader?.puzzleSpecificSimplifyOptions,
    })
  })

  const applyKeyboardMove = useEventCallback((event: KeyboardEvent) => {
    const move = keyToMove(cube3x3x3KeyMapping, event)?.toString()
    if (!move) return
    applyMove(move)
  })

  return { applyMove, simulatorRef, applyKeyboardMove, player }
}

const PUZZLE_ID_MAP: Record<Discipline, PuzzleID> = {
  '3by3': '3x3x3',
  '2by2': '2x2x2',
  '4by4': '4x4x4',
} as const
