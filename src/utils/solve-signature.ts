import { env } from '@/env'
import { resultDnfish } from '@/types'
import jws from 'jws'
import { z } from 'zod'

const alg = 'HS256'

const solveSchema = z.object({ result: resultDnfish, solution: z.string() })
type Solve = z.infer<typeof solveSchema>

const JWS_SECRET = env.NEXT_PUBLIC_SOLVE_SECRET + "don't cheat please"
// NOTE: yes we use a client side environment variable to verify solves, this isn't ideal but better than nothing
export function signSolve(solve: Solve) {
  return jws.sign({
    header: { alg },
    secret: JWS_SECRET,
    payload: solve,
  })
}
export function decodeSolve(
  solveJWS: string,
):
  | { solve: Solve; signatureMatches: true }
  | { solve: null; signatureMatches: false } {
  const correctSignature = jws.verify(solveJWS, 'HS256', JWS_SECRET)
  if (!correctSignature) return { solve: null, signatureMatches: false }

  const solve = solveSchema.parse(
    JSON.parse(jws.decode(solveJWS)?.payload as string),
  )
  return { solve, signatureMatches: true }
}
