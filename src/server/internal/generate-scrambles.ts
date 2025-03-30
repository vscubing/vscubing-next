import type { Discipline } from '@/app/_types'
import { tryCatch } from '@/app/_utils/try-catch'
import childProcess from 'child_process'
import path from 'path'
import { promisify } from 'util'

const execFile = promisify(childProcess.execFile)
export async function generateScrambles(
  discipline: Discipline,
  quantity: number,
) {
  const binaryPath = path.join(
    process.cwd(),
    'vendor',
    'tnoodle-cli-linux_x64',
    'bin',
    'tnoodle',
  )
  const { data, error } = await tryCatch(
    execFile(binaryPath, [
      'scramble',
      '--puzzle',
      TNOODLE_DISCIPLINE_MAP[discipline],
      '--count',
      String(quantity),
    ]),
  )
  if (error) {
    error.message = `[TNOODLE] ${error.message}`
    throw error
  }
  if (typeof data.stdout !== 'string') throw new Error()
  const scrambles = data.stdout.trim().split('\n')
  if (scrambles.length !== quantity)
    throw new Error(
      `[TNOODLE] Something went wrong during the scramble generation. Expected ${quantity} scrambles, received ${scrambles.length}`,
    )
  return scrambles
}

const TNOODLE_DISCIPLINE_MAP: Record<Discipline, string> = {
  '3by3': 'three',
  '2by2': 'two',
} as const
