'use client'

import { cn } from '@/app/_utils/cn'
import type { User } from 'next-auth'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from '../store/mobileMenuOpenAtom'
import { Slot } from '@radix-ui/react-slot'
import { signOut, useSession } from 'next-auth/react'
import { SignInButton } from '@/app/_shared/SignInButton'
import {
  AvatarIcon,
  ChevronDownIcon,
  SettingIcon,
  Dialog,
  DialogTrigger,
  LogoutIcon,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/app/_components/ui'
import { LoadingDots } from '@/app/_components/ui/loading-dots'

export function UserDropdownOrSignIn() {
  const { data, status } = useSession()

  if (status === 'loading') return <LoadingDots className='pr-4' />
  if (data === null) return <SignInButton variant='ghost' />
  return <UserDropdown user={data.user} className='md:-mr-2 sm:mr-0' />
}

function UserDropdown({ user, className }: { user: User; className?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger
        className={cn(
          'group flex items-center gap-3 whitespace-nowrap rounded-xl px-2 py-3 data-[state=open]:bg-grey-100 md:gap-1',
          className,
        )}
      >
        <AvatarIcon />
        <span className='text-large vertical-alignment-fix sm:hidden'>
          {user.name}
        </span>
        <ChevronDownIcon className='group-data-[state=open]:rotate-180' />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align='end'
        className='z-10 mt-1 min-w-[15.7rem] rounded-xl border border-black-80 bg-black-100 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2'
      >
        <DropdownMenu.Label className='title-h3 text-white mb-1'>
          {user.name}
        </DropdownMenu.Label>
        <DropdownMenu.Label className='mb-6 border-b border-b-grey-100 pb-2 text-grey-20'>
          {user.email}
        </DropdownMenu.Label>
        <DropdownMenu.Group className='-ml-2 flex flex-col gap-2'>
          <DropdownButton className='w-full cursor-pointer' asChild>
            <DropdownMenu.Item asChild>
              {/* DropdownMenu.Item must be a direct parent of Link for it to work */}
              <Link href='/settings'>
                <SettingIcon />
                Settings
              </Link>
            </DropdownMenu.Item>
          </DropdownButton>
          <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
            {/* the dropdown is closed after dialog is closed because triggering dialogs from dropdowns in radix works weirdly */}
            <LogoutButton
              className='w-full'
              onDialogClose={() => setIsOpen(false)}
            />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function LogoutButton({
  className,
  onDialogClose,
}: {
  className?: string
  onDialogClose: () => void
}) {
  const setMobileMenuOpen = useSetAtom(mobileMenuOpenAtom)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) onDialogClose()
      }}
    >
      <DropdownButton className={className} asChild>
        <DialogTrigger>
          <LogoutIcon />
          Log out
        </DialogTrigger>
      </DropdownButton>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Are you sure you want to log out?</DialogTitle>
          <DialogFooter className='sm:grid sm:grid-cols-2'>
            <DialogClose version='secondary'>Stay</DialogClose>
            <DialogClose
              version='primary'
              onClick={() => {
                setMobileMenuOpen(false)
                void signOut()
              }}
            >
              Log out
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

function DropdownButton({
  ref,
  children,
  className,
  asChild = false,
}: { children: ReactNode; className?: string; asChild?: boolean } & {
  ref?: React.RefObject<HTMLButtonElement>
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'transition-base outline-ring btn-sm inline-flex h-9 items-center gap-2 rounded-xl px-2 text-white-100 hover:bg-grey-100 active:bg-grey-80 disabled:text-grey-60',
        className,
      )}
      ref={ref}
    >
      {children}
    </Comp>
  )
}
