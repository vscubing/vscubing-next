import { HintSignInSection } from '@/app/_shared/HintSection'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { auth } from '@/server/auth'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
import { SettingsList } from './_page-content'
import { api } from '@/trpc/server'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return <HintSignInSection />

  const initialData = await api.settings.simulatorSettings()
  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <div className='h-full rounded-2xl bg-black-80 p-6 sm:p-3'>
        <SettingsList initialData={initialData} />
      </div>
    </>
  )
}
