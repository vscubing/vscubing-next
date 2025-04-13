import { Navbar } from './_layout/components/navbar'
import { PickUsernameDialog } from './_layout/components/pick-username-dialog'
import { PopupSidebar } from './_layout/components/popup-sidebar'
import { Sidebar } from './_layout/components/sidebar'
import { LayoutHeader } from './_layout/layout-header'
import { cn } from '@/frontend/utils/cn'
import ClientOnlyPortal from '@/frontend/utils/client-only-portal'
import type { ReactNode } from 'react'
import { Toaster } from '@/frontend/ui'

const MAIN_OVERLAY_ID = 'main-overlay'

export default function AppLayout({
  children,
  withoutHeader = false,
}: {
  children: React.ReactNode
  withoutHeader?: boolean
}) {
  return (
    <>
      <Toaster />
      <PickUsernameDialog />
      <PopupSidebar />
      <div
        vaul-drawer-wrapper='vaul-drawer-wrapper'
        className='flex h-full gap-3 bg-black-100 p-[1.625rem] sm:flex-col sm:gap-0 sm:px-3 sm:py-0'
      >
        <Sidebar className='w-[clamp(16rem,20vw,21rem)] xl-short:min-w-[19rem] lg:sr-only' />
        <main className='relative flex h-[calc(100svh-3.25rem)] flex-1 flex-col overflow-y-scroll rounded-2xl'>
          {withoutHeader ? null : <LayoutHeader className='mb-3 sm:mb-2' />}
          <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
            {children}
          </section>
        </main>
        <BottomNavbar className='hidden sm:block' />
        <div className='pointer-events-none fixed inset-0 flex p-[1.625rem] sm:px-0 sm:pb-16'>
          <div className='w-[clamp(16rem,20vw,21rem)] opacity-0 xl-short:min-w-[19rem] lg:sr-only' />
          <div className='relative flex-1' id={MAIN_OVERLAY_ID}></div>
        </div>
      </div>
    </>
  )
}

function BottomNavbar({ className }: { className: string }) {
  return (
    <div className={cn('sticky bottom-0 bg-black-100 pb-1', className)}>
      <div className='rounded-b-xl border-b border-grey-20'>
        <Navbar variant='horizontal' />
      </div>
    </div>
  )
}

export function LayoutMainOverlayPortal({ children }: { children: ReactNode }) {
  return (
    <ClientOnlyPortal selector={`#${MAIN_OVERLAY_ID}`}>
      {children}
    </ClientOnlyPortal>
  )
}
