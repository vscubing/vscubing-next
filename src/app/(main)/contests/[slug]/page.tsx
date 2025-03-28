import { db } from '@/server/db'
import { contestsToDisciplinesTable } from '@/server/db/schema'
import React from 'react'

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return ''
  // const discipline = '3by3'
  // const { slug: contestSlug } = await params
  // const results = db.select().from(contestsToDisciplinesTable).where()
  // return <div>Contest {contestSlug}</div>
}
