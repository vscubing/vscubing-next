import { type Config } from 'drizzle-kit'

import { env } from '@/env'

export default {
  schema: './src/backend/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config
