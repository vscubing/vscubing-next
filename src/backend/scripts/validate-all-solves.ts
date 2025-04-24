import { eq } from 'drizzle-orm'
import { db } from '../db'
import { roundTable, scrambleTable, solveTable } from '../db/schema'
import { validateSolve } from '../shared/validate-solve'

// NOTE: this isn't used anywhere in the codebase, it's just for testing the valdation
const solves = await db
  .select({
    id: solveTable.id,
    solution: solveTable.solution,
    scramble: scrambleTable.moves,
    discipline: roundTable.disciplineSlug,
  })
  .from(solveTable)
  .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
  .innerJoin(roundTable, eq(roundTable.id, scrambleTable.roundId))
  .where(eq(solveTable.isDnf, false))

for (const [idx, { discipline, id, scramble, solution }] of solves.entries()) {
  const isSolved = await validateSolve({
    discipline,
    scramble,
    solution: solution!,
  })
  if (!isSolved) console.error(`idx: ${idx}, solveId: ${id}`)
}
process.exit()
