import { DEFAULT_DISCIPLINE, isDiscipline } from '@/app/_types'
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
import { redirect } from 'next/navigation'
import React from 'react'

export default async function ContestPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await params
  const awaitedSearch = await searchParams
  const discipline = awaitedSearch.discipline ?? DEFAULT_DISCIPLINE
  if (!isDiscipline(discipline)) redirect(`/contests/${contestSlug}`)

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
      <tbody>
        {results.map(
          ({ position, state, nickname, timeMs, avgMs, solveId }) => (
            <tr key={solveId}>
              <td>position: {position}</td> <td>state: {state}</td>
              <td>nickname: {nickname}</td>
              <td>
                <Link href={`/contests/${contestSlug}/watch/${solveId}`}>
                  timeMs: {timeMs}
                </Link>
              </td>
              <td>avgMs: {avgMs}</td> <td>solveId: {solveId}</td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}
