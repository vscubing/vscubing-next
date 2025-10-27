import { env } from '@/env'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(env.TELEGRAM_TOKEN)

export async function sendTelegramMessage(
  message: string,
  thread: 'contest-management',
) {
  const envPrefix = `[${env.NEXT_PUBLIC_APP_ENV}] `
  return bot.sendMessage(env.TELEGRAM_CHAT_ID, envPrefix + message, {
    message_thread_id: THREAD_ID_MAP[thread],
  })
}

const THREAD_ID_MAP = {
  'contest-management': env.TELEGRAM_CONTEST_MANAGEMENT_THREAD_ID,
}
