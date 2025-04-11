import { type Config } from 'drizzle-kit'

if (!process.env.DATABASE_URL)
  // we can't use @/env here because it has to run in the deployment container
  throw new Error('DATABASE_URL env variable is required')

export default {
  schema: './src/backend/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config
