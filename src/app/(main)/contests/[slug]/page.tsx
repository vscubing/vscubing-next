import React from 'react'

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>Contest {slug}</div>
}
