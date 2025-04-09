import { tryCatch } from '@/utils/try-catch'
import { env } from '@/env'
import {
  closeOngoingAndCreateNewContest,
  NO_ONGOING_CONTEST_ERROR_MESSAGE,
} from '@/backend/shared/contest-management'
import type { NextRequest } from 'next/server'
import { sendTelegramMessage } from '@/backend/shared/telegram'

export async function POST(request: NextRequest) {
  const token = new Headers(request.headers)
    .get('Authorization')
    ?.slice('Bearer '.length)
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
    `[CONTEST MANAGEMENT] Closed ongoing and published Contest ${newContestSlug} (cause: webhook)`,
  )
  await sendTelegramMessage(
    `Closed ongoing and published Contest ${newContestSlug} (cause: webhook)`,
    'contest-management',
  )
  return new Response(`Successfully published Contest ${newContestSlug}`)
}
