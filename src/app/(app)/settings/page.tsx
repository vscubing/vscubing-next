import { HintSignInSection } from '@/frontend/shared/hint-section'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { auth } from '@/backend/auth'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
import { SettingsList } from './components/settings-list'
import { api } from '@/trpc/server'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return <HintSignInSection />

  const initialData = await api.settings.simulatorSettings()
  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <div className='flex h-full flex-col gap-6 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
        <SettingsList initialData={initialData} />
      </div>
    </>
  )
}
