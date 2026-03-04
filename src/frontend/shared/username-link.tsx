import Link from 'next/link'
import { cn } from '@/frontend/utils/cn'

export function UsernameLink({
  username,
  className,
}: {
  username: string
  className?: string
}) {
  return (
    <Link
      href={`/profile/${username}`}
      className={cn('hover:underline', className)}
    >
      {username}
    </Link>
  )
}
