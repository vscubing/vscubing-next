import type { db } from '@/backend/db'

export type SetOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Make all properties in T required
 */
export type FieldsNonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type Transaction = Parameters<
  Parameters<(typeof db)['transaction']>[0]
>[0]
