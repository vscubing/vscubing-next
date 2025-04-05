import { HintSignInSection } from '@/app/_shared/HintSection'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { auth } from '@/server/auth'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
import { PageContent } from './_page-content'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return <HintSignInSection />
  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <PageContent />
    </>
  )
}
