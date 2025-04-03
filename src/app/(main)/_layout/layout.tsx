import { cn } from '@/app/_utils/cn'
import { PopupSidebar } from './components/popup-sidebar'
import { Sidebar } from './components/sidebar'
import { Navbar } from './components/navbar'
import { PickUsernameDialog } from './components/pick-username-dialog'
import { SessionProvider } from 'next-auth/react'
import { LayoutHeader } from './layout-header'

export function Layout({
  children,
  withoutHeader = false,
}: {
  children: React.ReactNode
  withoutHeader?: boolean
}) {
  return (
    <SessionProvider>
      <PickUsernameDialog />
      <PopupSidebar />
      <div className='bg-black-100'>
        <div
          vaul-drawer-wrapper='vaul-drawer-wrapper'
          className='flex h-svh gap-3 bg-black-100 p-[1.625rem] sm:flex-col sm:gap-0 sm:px-3 sm:py-0'
        >
          {/* TODO: display grid */}
          <Sidebar className='w-[clamp(16rem,20vw,21rem)] xl-short:min-w-[19rem] lg:sr-only' />
          <div className='flex flex-1 flex-col'>
            {withoutHeader ? null : <LayoutHeader className='mb-3 sm:mb-2' />}
            <main className='contents'>
              <section className='flex flex-1 flex-col gap-3 overflow-y-auto sm:gap-2'>
                {children}
              </section>
            </main>
          </div>
          <BottomNavbar className='hidden sm:block' />
        </div>
      </div>
    </SessionProvider>
  )
}

function BottomNavbar({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'h-[var(--mobile-bottom-nav-height)] bg-black-100',
        className,
      )}
    >
      <div className='rounded-b-xl border-b border-grey-20'>
        <Navbar variant='horizontal' />
      </div>
    </div>
  )
}
