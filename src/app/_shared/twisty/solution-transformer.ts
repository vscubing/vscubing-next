import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import { type AlgNode, Move, Newline } from '@vscubing/cubing/alg'
import { puzzles } from '@vscubing/cubing/puzzles'
import {
  type AnimationTimelineLeaf,
  getSolveAnalyzer,
} from '@vscubing/cubing/twisty'
import { Alg, LineComment } from '@vscubing/cubing/alg'
import type { Discipline } from '@/types'
import { removeSolutionComments } from '@/app/_utils/remove-solution-comments'

// TODO: simultaneous moves???
export async function doEverything(
  scramble: string,
  solutionWithTimings: string,
  discipline: Discipline,
): Promise<{ solution: Alg; animLeaves?: AnimationTimelineLeaf[] }> {
  const timestamps = parseTimestamps(solutionWithTimings)

  let solution = new Alg(removeSolutionComments(solutionWithTimings))
  const rawSignatures = await ANALYZER_MAP[discipline](scramble, solution)
  const signaturesWithDurations = embedDurations(rawSignatures, timestamps)
  solution = annotateMoves(solution, signaturesWithDurations)

  if (!timestamps) {
    return { solution }
  }

  const animatableNodes = Array.from(solution.childAlgNodes()).filter((node) =>
    node.is(Move),
  )

  if (animatableNodes.length !== timestamps?.length) {
    console.error('[TWISTY] animatableNodes.length !== leafSlots.length')
    return { solution: solution }
  }

  const animLeaves: AnimationTimelineLeaf[] = animatableNodes.map(
    (node, idx) => ({
      start: timestamps[idx]!,
      end: Math.min(timestamps[idx]! + 120, timestamps[idx + 1] ?? Infinity),
      animLeaf: node,
    }),
  )

  return { solution, animLeaves }
}

function embedDurations(
  rawSignatures: (string | null)[],
  timestamps?: number[],
) {
  let lastIdxWithSignature = -1
  return rawSignatures.map((signature, idx) => {
    if (signature === null) return null
    let comment = ` ${signature}`

    if (timestamps) {
      const stepDuration =
        lastIdxWithSignature === -1
          ? timestamps[idx]!
          : timestamps[idx]! - timestamps[lastIdxWithSignature]!
      lastIdxWithSignature = signature === INSPECTION_SIGNATURE ? idx + 1 : idx
      if (stepDuration > 0 && signature !== INSPECTION_SIGNATURE) {
        comment += ` (${formatSolveTime(stepDuration, true)}s)`
      }
    }

    return comment
  })
}

function annotateMoves(
  solution: Alg,
  signaturesWithDurations: (string | null)[],
) {
  const res: AlgNode[] = []
  Array.from(solution.childAlgNodes()).forEach((node, idx) => {
    res.push(node)

    const comment = signaturesWithDurations[idx]
    if (comment) {
      res.push(new LineComment(comment))
      res.push(new Newline())
    }
  })
  return new Alg(res)
}

function parseTimestamps(solutionWithTimestamps: string): number[] | undefined {
  const timestamps = solutionWithTimestamps
    .split('*')
    .filter((_, idx) => idx % 2 === 1)
    .map(Number)
  if (timestamps.length === 0) return undefined

  const hasInspection = timestamps[0] === 0 && timestamps[1] === 0
  if (!hasInspection) return timestamps

  let shift = 0
  return timestamps.map((timestamp, idx) => {
    if (timestamp === 0 && idx > 0) shift += 300
    return timestamp + shift
  })
}

type Analyzer = (
  scramble: Alg | string,
  solution: Alg | string,
) => Promise<(string | null)[]>
const ANALYZER_MAP: Record<Discipline, Analyzer> = {
  '3by3': async (scramble, solution) => {
    const puzzleLoader = puzzles['3x3x3']!
    const kpuzzle = await puzzleLoader.kpuzzle()
    const solved = kpuzzle.defaultPattern()
    const analyzeSolve = await getSolveAnalyzer(puzzleLoader)

    const signatures: (string | null)[] = []

    let inInspection = true
    let solutionSoFar = new Alg()
    for (const [idx, node] of Array.from(
      new Alg(solution).childAlgNodes(),
    ).entries()) {
      solutionSoFar = new Alg([...solutionSoFar.childAlgNodes(), node])

      const pattern = solved.applyAlg(scramble).applyAlg(solutionSoFar)
      signatures.push(analyzeSolve(pattern))

      if (!isRotation(node) && inInspection) {
        inInspection = false
        if (idx > 0) {
          signatures[signatures.length - 2] = INSPECTION_SIGNATURE
        }
      }
    }
    return signatures
  },
  '2by2': (_, solution) => {
    const signatures: (string | null)[] = []

    let inInspection = true
    let solutionSoFar = new Alg()
    for (const node of new Alg(solution).childAlgNodes()) {
      solutionSoFar = new Alg([...solutionSoFar.childAlgNodes(), node])

      signatures.push(null)

      if (!isRotation(node) && inInspection) {
        inInspection = false
        if (signatures.length > 1) {
          signatures[signatures.length - 2] = INSPECTION_SIGNATURE
        }
      }
    }

    signatures[signatures.length - 1] = 'Solved'

    return new Promise((res) => res(signatures))
  },
}

const INSPECTION_SIGNATURE = 'Inspection'
function isRotation(node: AlgNode): boolean {
  return ['x', 'y', 'z'].includes(node.toString()[0]!)
}
