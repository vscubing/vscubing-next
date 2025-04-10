import { MenuIcon } from '@/frontend/ui'
import { type ReactNode } from 'react'
import { ControlMobileMenuButton } from './store/mobile-menu-open-atom'
import { cn } from '@/frontend/utils/cn'
import { LogoWithLinkToLanding } from './components/logo'
import { UserDropdownOrSignIn } from './components/user-dropdown-or-sign-in'
import ClientOnlyPortal from '@/frontend/utils/client-only-portal'
import { LoadingDots } from '@/frontend/ui/loading-dots'

const HEADER_TITLE_ID = 'header-title'

export function LayoutHeader({ className }: { className?: string }) {
  return (
    <header className={cn('z-40 flex bg-black-100 sm:pb-2 sm:pt-3', className)}>
      <ControlMobileMenuButton
        mode={true}
        className='mr-2 hidden h-[4.375rem] w-[4.375rem] items-center justify-center rounded-2xl bg-black-80 lg:flex sm:h-14 sm:w-14'
      >
        <MenuIcon />
      </ControlMobileMenuButton>
      <div className='flex h-[var(--header-height)] flex-1 items-center justify-between rounded-2xl bg-black-80 px-4 lg:justify-end sm:pl-4 sm:pr-2'>
        <LogoWithLinkToLanding className='mr-auto hidden lg:block' />
        <h1 className='title-h3 lg:hidden sm:hidden' id={HEADER_TITLE_ID} />
        <span className='flex items-center justify-end'>
          <UserDropdownOrSignIn />
        </span>
      </div>
    </header>
  )
}

export function LayoutHeaderTitlePortal({ children }: { children: ReactNode }) {
  return (
    <ClientOnlyPortal selector={`#${HEADER_TITLE_ID}`}>
      {children}
    </ClientOnlyPortal>
  )
}

export function LayoutHeaderTitlePortalFallback() {
  return (
    <ClientOnlyPortal selector={`#${HEADER_TITLE_ID}`}>
      <LoadingDots />
    </ClientOnlyPortal>
  )
}
