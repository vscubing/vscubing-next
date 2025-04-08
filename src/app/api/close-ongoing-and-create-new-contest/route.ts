import { tryCatch } from '@/app/_utils/try-catch'
import { env } from '@/env'
import {
  closeOngoingAndCreateNewContest,
  NO_ONGOING_CONTEST_ERROR_MESSAGE,
} from '@/server/internal/ongoing-contest-admin'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const token = new Headers(request.headers).get('Authorization')
  if (!token) {
    console.log('[CONTEST MANAGEMENT] Webhook secret required')
    return new Response('Webhook secret required', { status: 401 })
  }
  if (token !== env.CONTEST_CREATION_WEBHOOK_SECRET) {
    console.log(
      `[CONTEST MANAGEMENT] Incorrect webhook secret. Expected: \n"${env.CONTEST_CREATION_WEBHOOK_SECRET}" (${env.CONTEST_CREATION_WEBHOOK_SECRET.length}) \n Received:\n"${token}" (${token.length})`,
    )
    return new Response('Incorrect webhook secret', { status: 403 })
  }

  const { data, error } = await tryCatch(closeOngoingAndCreateNewContest())
  if (error?.message === NO_ONGOING_CONTEST_ERROR_MESSAGE) {
    console.log(`[CONTEST MANAGEMENT] ${NO_ONGOING_CONTEST_ERROR_MESSAGE}`)
    return new Response(error.message, { status: 412 })
  }
  if (error) throw error

  const { newContestSlug } = data

  console.log(
    `[CONTEST MANAGEMENT] Successfully created Contest ${newContestSlug}`,
  )
  return new Response(`Successfully created Contest ${newContestSlug}`)
}
