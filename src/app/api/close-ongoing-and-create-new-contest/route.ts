import type { NextRequest } from 'next/server'

export async function POST() {
  // TODO: replace with a package.json script and a built-in Dokploy cron job
  // const token = new Headers(request.headers)
  //   .get('Authorization')
  //   ?.slice('Bearer '.length)
  // if (!token) {
  //   console.error('[CONTEST MANAGEMENT] Webhook secret required')
  //   return new Response('Webhook secret required', { status: 401 })
  // }
  // if (token !== env.CONTEST_CREATION_WEBHOOK_SECRET) {
  //   console.error('[CONTEST MANAGEMENT] Incorrect webhook secret')
  //   // console.error(
  //   //   `[CONTEST MANAGEMENT] Incorrect webhook secret. Expected: \n"${env.CONTEST_CREATION_WEBHOOK_SECRET}" (${env.CONTEST_CREATION_WEBHOOK_SECRET.length}) \n Received:\n"${token}" (${token.length})`,
  //   // )
  //   return new Response('Incorrect webhook secret', { status: 403 })
  // }
  //
  // const { data, error } = await tryCatch(closeOngoingAndCreateNewContest())
  // if (error?.message === NO_ONGOING_CONTEST_ERROR_MESSAGE) {
  //   console.error(`[CONTEST MANAGEMENT] ${NO_ONGOING_CONTEST_ERROR_MESSAGE}`)
  //   return new Response(error.message, { status: 412 })
  // }
  // if (error) throw error
  //
  // const { newContestSlug } = data
  //
  // console.error(
  //   `[CONTEST MANAGEMENT] Closed ongoing and published Contest ${newContestSlug} (cause: webhook)`,
  // )
  // if (env.NEXT_PUBLIC_APP_ENV !== 'development')
  //   await sendTelegramMessage(
  //     `Closed ongoing and published Contest ${newContestSlug} (cause: webhook)`,
  //     'contest-management',
  //   )
  // return new Response(`Successfully published Contest ${newContestSlug}`)
}
