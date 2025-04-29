import { pusherServer } from '@/app/(app)/contests/[contestSlug]/watch/(live)/pusher-server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const req = await request.formData()
  console.log('auth-user', Array.from(req.entries()))
  const socketId = z.string().parse(req.get('socket_id'))

  const user_id = z.string().parse(request.headers.get('user_id'))
  const authResponse = pusherServer.authenticateUser(socketId, { id: user_id })
  return Response.json(authResponse)
}
