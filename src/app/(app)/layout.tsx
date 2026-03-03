import { Navbar } from './_layout/components/navbar'
import { PickUsernameDialog } from './_layout/components/pick-username-dialog'
import { PopupSidebar } from './_layout/components/popup-sidebar'
import { Sidebar } from './_layout/components/sidebar'
import { LayoutHeader } from './_layout/layout-header'
import { cn } from '@/frontend/utils/cn'
import ClientOnlyPortal from '@/frontend/utils/client-only-portal'
import { type ReactNode } from 'react'
import { Toaster } from '@/frontend/ui'
import { CookieBannerHandler } from '@/frontend/cookie-banner-handler'

export default function AppLayout({
  children,
  withoutHeader = false,
}: {
  children: React.ReactNode
  withoutHeader?: boolean
}) {
  const SIDEBAR_WIDTH_CLASS =
    'w-[clamp(15rem,17vw,21rem)] xl-short:min-w-[19rem] lg:w-[4.375rem] sm:sr-only'

  return (
    <>
      <Toaster />
      <PickUsernameDialog />
      <PopupSidebar />
      <CookieBannerHandler />
      <div
        vaul-drawer-wrapper='vaul-drawer-wrapper'
        className='bg-black-100 flex h-full gap-3 p-[1.625rem] sm:flex-col sm:gap-0 sm:py-0 lg:p-3'
      >
        <Sidebar className={SIDEBAR_WIDTH_CLASS} />
        <main
          id={SCROLL_CONTAINER_ID}
          className='scrollbar relative flex h-[calc(100svh-3.25rem)] flex-1 flex-col overflow-y-auto rounded-2xl lg:h-[calc(100svh-1.5rem)]'
        >
          {withoutHeader ? null : <LayoutHeader className='mb-3 sm:mb-2' />}
          {children}
        </main>
        <BottomNavbar className='hidden sm:block' />
        <div className='pointer-events-none fixed inset-0 flex p-[1.625rem] sm:px-0 sm:pb-16 lg:p-3'>
          <div className={SIDEBAR_WIDTH_CLASS} />
          <div className='relative flex-1' id={MAIN_OVERLAY_ID}></div>
        </div>
      </div>
    </>
  )
}

function BottomNavbar({ className }: { className: string }) {
  return (
    <div className={cn('bg-black-100 sticky bottom-0 pb-1', className)}>
      <div className='border-grey-20 rounded-b-xl border-b'>
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
