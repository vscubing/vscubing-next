import { pusherServer } from '@/app/(app)/contests/[contestSlug]/watch/(live)/pusher-server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const req = await request.formData()
  console.log('auth-channel', Array.from(req.entries()))
  const socketId = z.string().parse(req.get('socket_id'))
  const channelName = z.string().parse(req.get('channel_name'))

  const user_id = z.string().parse(request.headers.get('user_id'))
  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: user_id,
    user_info: { user_id, hehe: 123 },
  })
  return Response.json(authResponse)
}
