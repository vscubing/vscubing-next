import { HintSignInSection } from '@/frontend/shared/hint-section'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { auth } from '@/backend/auth'
import { LayoutHeaderTitlePortal } from '../_layout/layout-header'
import { SettingsList } from './_page-content'
import { api } from '@/trpc/server'
import { PrimaryButton } from '@/frontend/ui'
import Link from 'next/link'
import { db } from '@/backend/db'
import { accountTable } from '@/backend/db/schema'
import { and, eq } from 'drizzle-orm'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return <HintSignInSection />

  const initialData = await api.settings.simulatorSettings()
  return (
    <>
      <NavigateBackButton />
      <LayoutHeaderTitlePortal>Simulator settings</LayoutHeaderTitlePortal>
      <div className='flex h-full flex-col gap-6 rounded-2xl bg-black-80 p-6 sm:p-3'>
        <SettingsList initialData={initialData} />
        <WcaSignIn />
      </div>
    </>
  )
}

async function WcaSignIn() {
  const session = await auth()
  if (!session) return <HintSignInSection />

  const [wcaInfo] = await db
    .select({ wcaId: accountTable.providerAccountId })
    .from(accountTable)
    .where(
      and(
        eq(accountTable.provider, 'wca'),
        eq(accountTable.userId, session.user.id),
      ),
    )
  return wcaInfo ? (
    <p className='title-h3'>
      WCA ID:{' '}
      <Link
        href={`https://worldcubeassociation.org/persons/${wcaInfo.wcaId}`}
        className='text-secondary-20 underline'
      >
        {wcaInfo.wcaId}
      </Link>
    </p>
  ) : (
    <PrimaryButton
      className='pointer-events-none bg-grey-40 text-grey-60'
      asChild
    >
      <Link href='/api/auth/wca?redirectTo=/settings'>
        Sign in with WCA (currently disabled)
      </Link>
    </PrimaryButton>
  )
}
