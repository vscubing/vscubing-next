import { FlaskConicalIcon } from 'lucide-react'

export function ExperimentalBadge() {
  return (
    <div className='flex items-center gap-2 rounded-lg bg-yellow-80/20 px-3 py-2 text-sm text-yellow-100'>
      <FlaskConicalIcon className='h-4 w-4 flex-shrink-0' />
      <span>
        Experimental feature — expect things to break (a page refresh might
        help), we also might remove it in the future.
      </span>
    </div>
  )
}
