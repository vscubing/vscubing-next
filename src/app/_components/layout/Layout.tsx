import { cn } from '@/app/_utils/cn'
import { PopupSidebar } from './components/popup-sidebar'
import { Sidebar } from './components/sidebar'
import { Navbar } from './components/navbar'
import { PickUsernameDialog } from './components/pick-username-dialog'

type LayoutProps = { children: React.ReactNode }
export function Layout({ children }: LayoutProps) {
  return (
    <>
      <PickUsernameDialog />
      <PopupSidebar />
      <div className='bg-black-100'>
        <div
          vaul-drawer-wrapper='vaul-drawer-wrapper'
          className='flex h-svh gap-3 bg-black-100 p-[1.625rem] sm:flex-col sm:gap-0 sm:px-3 sm:py-0'
        >
          <Sidebar className='w-[clamp(16rem,20vw,21rem)] xl-short:min-w-[19rem] lg:sr-only' />
          <main className='flex flex-1 flex-col overflow-y-auto'>
            {children}
          </main>
          <BottomNavbar className='hidden sm:block' />
        </div>
      </div>
    </>
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
