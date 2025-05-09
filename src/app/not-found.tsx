import {
  NotFoundContent,
  NotFoundWrapper,
} from '@/frontend/shared/not-found-content'
import Layout from './(app)/layout'

export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <NotFoundWrapper>
      <Layout withoutHeader>
        <NotFoundContent />
      </Layout>
    </NotFoundWrapper>
  )
}
