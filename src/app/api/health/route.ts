import { db } from '@/backend/db'
import { userTable } from '@/backend/db/schema'

export async function GET() {
  await db.select().from(userTable).limit(0)
  return Response.json({ ok: true })
}
