import { MenuIcon } from '@/app/_components/ui'
import { type ReactNode } from 'react'
import { ControlMobileMenuButton } from './store/mobileMenuOpenAtom'
import { cn } from '@/app/_utils/cn'
import { LogoWithLinkToLanding } from './components/logo'
import { UserDropdownOrSignIn } from './components/user-dropdown-or-sign-in'

type LayoutHeaderProps = { title?: ReactNode; className?: string }
export async function LayoutHeader({ title, className }: LayoutHeaderProps) {
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
        <h1 className='title-h3 lg:hidden sm:hidden'>{title}</h1>
        <span className='flex items-center justify-end'>
          <UserDropdownOrSignIn />
        </span>
      </div>
    </header>
  )
}
