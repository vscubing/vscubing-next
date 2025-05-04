import { HintSignInSection } from '@/frontend/shared/hint-section'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { auth } from '@/backend/auth'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
import { SettingsList } from './components/settings-list'
import { SettingsPreviewSimulator } from './components/settings-preview-simulator'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return <HintSignInSection />

  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <div className='flex h-full flex-col gap-6 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
        <div className='flex md:flex-col'>
          <SettingsList />
          <div className='md:mt-4 md:self-start'>
            <SettingsPreviewSimulator className='pointer-events-none aspect-square w-[300px] touch:hidden' />
          </div>
        </div>
      </div>
    </>
  )
}
