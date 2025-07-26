import { Navbar } from './_layout/components/navbar'
import { PickUsernameDialog } from './_layout/components/pick-username-dialog'
import { PopupSidebar } from './_layout/components/popup-sidebar'
import { Sidebar } from './_layout/components/sidebar'
import { LayoutHeader } from './_layout/layout-header'
import { cn } from '@/frontend/utils/cn'
import ClientOnlyPortal from '@/frontend/utils/client-only-portal'
import type { ReactNode } from 'react'
import { Toaster } from '@/frontend/ui'

export default function AppLayout({
  children,
  withoutHeader = false,
}: {
  children: React.ReactNode
  withoutHeader?: boolean
}) {
  const SIDEBAR_WIDTH_CLASS = 'w-[clamp(15rem,17vw,21rem)]'

  return (
    <>
      <Toaster />
      <PickUsernameDialog />
      <PopupSidebar />
      <div
        vaul-drawer-wrapper='vaul-drawer-wrapper'
        className='flex h-full gap-3 bg-black-100 p-[1.625rem] lg:p-3 sm:flex-col sm:gap-0 sm:py-0'
      >
        <Sidebar
          className={cn(
            'xl-short:min-w-[19rem] lg:w-auto sm:sr-only',
            SIDEBAR_WIDTH_CLASS,
          )}
        />
        <main
          id={SCROLL_CONTAINER_ID}
          className='relative flex h-[calc(100svh-3.25rem)] flex-1 flex-col overflow-y-auto rounded-2xl lg:h-[calc(100svh-1.5rem)]'
        >
          {withoutHeader ? null : <LayoutHeader className='mb-3 sm:mb-2' />}
          <section className='flex flex-grow flex-col gap-3 sm:gap-2'>
            {children}
          </section>
        </main>
        <BottomNavbar className='hidden sm:block' />
        <div className='pointer-events-none fixed inset-0 flex p-[1.625rem] sm:px-0 sm:pb-16'>
          <div
            className={cn(
              'opacity-0 xl-short:min-w-[19rem] lg:sr-only',
              SIDEBAR_WIDTH_CLASS,
            )}
          />
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

const SCROLL_CONTAINER_ID = 'scroll-container'
export function getScrollContainer() {
  const elem = document.querySelector(`#${SCROLL_CONTAINER_ID}`)
  if (!elem) throw new Error('no #scroll-container!')
  return elem
}

const MAIN_OVERLAY_ID = 'main-overlay'
export function LayoutMainOverlayPortal({ children }: { children: ReactNode }) {
  return (
    <ClientOnlyPortal selector={`#${MAIN_OVERLAY_ID}`}>
      {children}
    </ClientOnlyPortal>
  )
}
