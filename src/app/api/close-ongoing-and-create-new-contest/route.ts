import { tryCatch } from '@/app/_utils/try-catch'
import {
  closeOngoingAndCreateNewContest,
  NO_ONGOING_CONTEST_ERROR_MESSAGE,
} from '@/server/internal/ongoing-contest-admin'

// TODO: authorization secret token
export async function GET() {
  const { data, error } = await tryCatch(closeOngoingAndCreateNewContest())
  if (error?.message === NO_ONGOING_CONTEST_ERROR_MESSAGE)
    return Response.json(error.message, { status: 412 })
  if (error) throw error

  const { newContestSlug } = data
  return Response.json({ newContestSlug })
}
