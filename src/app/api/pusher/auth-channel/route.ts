import { pusherServer } from '@/app/(app)/contests/[contestSlug]/watch/(live)/pusher-server'
import { auth } from '@/backend/auth'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const req = await request.formData()
  console.log('auth-channel', Array.from(req.entries()))
  const socketId = z.string().parse(req.get('socket_id'))
  const channelName = z.string().parse(req.get('channel_name'))

  const session = await auth()

  const userId = session?.user.id ?? generateGuestId()
  const username = session?.user.name ?? userId

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: { name: username },
  })
  return Response.json(authResponse)
}

function generateGuestId() {
  return `guest-${uuidv4()}`
}
