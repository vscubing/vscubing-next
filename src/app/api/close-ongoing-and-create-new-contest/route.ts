import { closeOngoingAndCreateNewContest } from '@/backend/shared/contest-management'
import { sendTelegramMessage } from '@/backend/shared/telegram'
import { env } from '@/env'
import { tryCatch } from '@/utils/try-catch'

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const token = url.searchParams.get('secret')
  if (!token) {
    return new Response('Webhook secret required', { status: 401 })
  }
  if (token !== env.CONTEST_CREATION_WEBHOOK_SECRET) {
    // console.error(
    //   `[CONTEST MANAGEMENT] Incorrect webhook secret. Expected: \n"${env.CONTEST_CREATION_WEBHOOK_SECRET}" (${env.CONTEST_CREATION_WEBHOOK_SECRET.length}) \n Received:\n"${token}" (${token.length})`,
    // )
    return new Response('Incorrect webhook secret', { status: 403 })
  }

  const { data, error } = await tryCatch(closeOngoingAndCreateNewContest())
  if (error) {
    await sendTelegramMessage(
      "Couldn't close ongoing and create new contest\n" +
        error.message +
        '\n' +
        JSON.stringify(error),
      'contest-management',
    )
    return new Response(error.message + '\n' + JSON.stringify(error), {
      status: 500,
    })
  }

  const { newContestSlug } = data

  // if (env.NEXT_PUBLIC_APP_ENV !== 'development')
  await sendTelegramMessage(
    `Closed ongoing and published Contest ${newContestSlug}`,
    'contest-management',
  )
  return new Response(`Successfully published Contest ${newContestSlug}`)
}
