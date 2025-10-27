import { closeOngoingAndCreateNewContest } from '@/backend/shared/contest-management'
import { sendTelegramMessage } from '@/backend/shared/telegram'
import { tryCatch } from '@/utils/try-catch'

const { data, error } = await tryCatch(closeOngoingAndCreateNewContest())
if (error) {
  await sendTelegramMessage(
    error.message + '\n' + JSON.stringify(error),
    'contest-management',
  )
  throw error
}

const { newContestSlug } = data

await sendTelegramMessage(
  `Closed ongoing and published Contest ${newContestSlug}`,
  // TODO: prepare messages
  'contest-management',
)

process.exit()
