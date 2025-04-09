import { eq } from 'drizzle-orm'
import { db } from '../db'
import { contestDisciplineTable, scrambleTable, solveTable } from '../db/schema'
import { validateSolve } from './validate-solve'

// NOTE: this isn't used anywhere in the codebase, it's just for testing the valdation
const solves = await db
  .select({
    id: solveTable.id,
    solution: solveTable.solution,
    scramble: scrambleTable.moves,
    discipline: contestDisciplineTable.disciplineSlug,
  })
  .from(solveTable)
  .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
  .innerJoin(
    contestDisciplineTable,
    eq(contestDisciplineTable.id, scrambleTable.contestDisciplineId),
  )
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
