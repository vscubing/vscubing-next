'use server'

import { pusherServer } from './pusher-server'

export async function testAction(channel: string, message: string) {
  await pusherServer.trigger(channel, 'message', message)
  console.log('incoming message', channel, message)
  return 'success'
}
