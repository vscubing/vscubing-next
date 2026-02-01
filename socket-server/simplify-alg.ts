import { Alg } from '@vscubing/cubing/alg'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { puzzles } from '@vscubing/cubing/puzzles'
import { experimentalSolve3x3x3IgnoringCenters } from '@vscubing/cubing/search'

export async function simplifyAlg(alg: string | Alg): Promise<string> {
  const kpuzzle = await puzzles['3x3x3']!.kpuzzle()
  const pattern = kpuzzle.defaultPattern().applyAlg(alg)

  // experimentalSolve3x3x3IgnoringCenters requires the puzzle to be in oriented state (think white top green front)
  const rotationToOrientPuzzle = getRotationToOrientPuzzle(pattern)
  // so we orient the puzzle first
  const orientedPattern = pattern.applyAlg(rotationToOrientPuzzle)
  const solution = await experimentalSolve3x3x3IgnoringCenters(orientedPattern)
  // and undo the orientation fix at the end
  return (
    solution.invert().toString() +
    ' ' +
    rotationToOrientPuzzle.invert().toString()
  )
}

function getRotationToOrientPuzzle(pattern: KPattern) {
  const moves =
    ROTATIONS_TO_ORIENT[
      serializePatternPieces(pattern.patternData.CENTERS!.pieces)
    ]
  return new Alg(moves)
}

function serializePatternPieces(pieces: number[]) {
  return pieces.join()
}

// NOTE: generated with `generateRotationsTable`
const ROTATIONS_TO_ORIENT: Record<string, string> = {
  '0,1,2,3,4,5': '',
  '0,2,3,4,1,5': "y'",
  '0,3,4,1,2,5': 'y2',
  '0,4,1,2,3,5': 'y',
  '1,5,2,0,4,3': "z'",
  '1,2,0,4,5,3': "y' z'",
  '1,0,4,5,2,3': "y2 z'",
  '1,4,5,2,0,3': "y z'",
  '3,0,2,5,4,1': 'z',
  '3,2,5,4,0,1': "y' z",
  '3,5,4,0,2,1': 'y2 z',
  '3,4,0,2,5,1': 'y z',
  '5,3,2,1,4,0': 'z2',
  '5,2,1,4,3,0': "y' z2",
  '5,1,4,3,2,0': 'y2 z2',
  '5,4,3,2,1,0': 'y z2',
  '2,1,5,3,0,4': "x'",
  '2,5,3,0,1,4': "y' x'",
  '2,3,0,1,5,4': "y2 x'",
  '2,0,1,5,3,4': "y x'",
  '4,1,0,3,5,2': 'x',
  '4,0,3,5,1,2': "y' x",
  '4,3,5,1,0,2': 'y2 x',
  '4,5,1,0,3,2': 'y x',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateRotationsTable() {
  const kpuzzle = await puzzles['3x3x3']!.kpuzzle()
  for (const r1 of ['', 'z', "z'", 'z2', 'x', "x'"]) {
    for (const r2 of ['', 'y', 'y2', "y'"]) {
      // all 6 (faces) * 4 (rotations) possible puzzle orientations
      const alg = new Alg(`${r1} ${r2}`)
      const pattern = kpuzzle.defaultPattern().applyAlg(alg)
      console.log(
        `"${serializePatternPieces(pattern.patternData.CENTERS!.pieces)}": "${alg.invert().toString()}",`,
      )
    }
  }
}
