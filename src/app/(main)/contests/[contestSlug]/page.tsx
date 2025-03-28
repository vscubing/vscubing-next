import { db } from '@/server/db'
import {
  usersTable,
  contestsToDisciplinesTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/server/db/schema'
import { and, eq } from 'drizzle-orm'
import Link from 'next/link'
import React from 'react'

export default async function ContestPage({
  params,
}: {
  params: Promise<{ contestSlug: string }>
}) {
  const discipline = '3by3'
  const { contestSlug } = await params
  const results = await db
    .select({
      solveId: solveTable.id,
      timeMs: solveTable.id,
      avgMs: roundSessionTable.avgMs,
      nickname: usersTable.name,
      position: scrambleTable.position,
      state: solveTable.state,
    })
    .from(contestsToDisciplinesTable)
    .where(
      and(
        eq(contestsToDisciplinesTable.contestSlug, contestSlug),
        eq(contestsToDisciplinesTable.disciplineSlug, discipline),
      ),
    )
    .leftJoin(
      roundSessionTable,
      eq(roundSessionTable.contestDisciplineId, contestsToDisciplinesTable.id),
    )
    .leftJoin(solveTable, eq(solveTable.roundSessionId, roundSessionTable.id))
    .leftJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
    .leftJoin(usersTable, eq(usersTable.id, roundSessionTable.contestantId))
    .orderBy(roundSessionTable.avgMs)
  return (
    <table>
      {results.map(({ position, state, nickname, timeMs, avgMs, solveId }) => (
        <tr key={solveId}>
          <td>position: {position}</td> <td>state: {state}</td>
          <td>nickname: {nickname}</td>
          <Link href={`/contests/${contestSlug}/watch/${solveId}`}>
            <td>timeMs: {timeMs}</td>
          </Link>
          <td>avgMs: {avgMs}</td> <td>solveId: {solveId}</td>
        </tr>
      ))}
    </table>
  )
}
