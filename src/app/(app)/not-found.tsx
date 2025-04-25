import {
  NotFoundContent,
  NotFoundWrapper,
} from '@/frontend/shared/not-found-content'

export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <NotFoundWrapper>
      <NotFoundContent />
    </NotFoundWrapper>
  )
}
