'use client'
import { cn } from '@/frontend/utils/cn'
import { useState, useEffect } from 'react'
import { Container } from './container'
import { CloseIcon, Logo, MenuIcon } from '@/frontend/ui'
import { DynamicLinkToApp } from './link-to-app'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export function ExtrasHeader({
  navigationLinks: navigationAnchors,
}: {
  navigationLinks: { href: string; name: string }[]
}) {
  const isWindowScrolled = useIsWindowScrolled()

  return (
    <header className={cn('fixed left-0 top-0 z-20 w-full')}>
      <Container>
        <div
          className={cn(
            'flex rounded-3xl bg-black-120 pl-9 pr-2 transition-all duration-100 md:pr-4',
            isWindowScrolled
              ? 'items-center bg-black-80/75 py-2 backdrop-blur-lg'
              : 'items-end pb-2 pt-9 md:pt-[1.625rem]',
          )}
        >
          <div className='flex w-full items-center gap-[6.25rem] lg:gap-20'>
            <a href='#'>
              <Logo variant='full' />
            </a>
            <nav className='vertical-alignment-fix flex gap-10 md:hidden'>
              {navigationAnchors.map(({ href, name }) => (
                <a
                  key={href}
                  href={href}
                  className='transition-base text-[1.125rem] font-medium text-grey-40 hover:text-white-100'
                >
                  {name}
                </a>
              ))}
            </nav>
            <DynamicLinkToApp className='ml-auto h-14 px-10 md:hidden' />
            <MobileMenu
              className='ml-auto hidden md:flex'
              navigationAnchors={navigationAnchors}
            />
          </div>
        </div>
      </Container>
    </header>
  )
}

function MobileMenu({
  className,
  navigationAnchors,
}: {
  className: string
  navigationAnchors: { href: string; name: string }[]
}) {
  return (
    <DialogPrimitive.Dialog>
      <DialogPrimitive.Trigger
        className={cn(
          'h-[44px] w-[44px] items-center justify-center text-white-100',
          className,
        )}
      >
        <MenuIcon />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className='fixed inset-0 z-20 flex flex-col gap-3 bg-black-120 p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        >
          <DialogPrimitive.Title className='sr-only'>
            Navigation menu
          </DialogPrimitive.Title>
          <div className='flex items-center justify-between rounded-3xl bg-black-100 px-4 py-2'>
            <Logo variant='full' />
            <DialogPrimitive.Close className='h-[44px] w-[44px] items-center justify-center'>
              <CloseIcon />
            </DialogPrimitive.Close>
          </div>
          <nav className='flex flex-1 flex-col items-center gap-11 rounded-b-3xl pt-6 text-[1rem] text-grey-40 [background:linear-gradient(180deg,rgba(6,7,9,1)_16%,rgba(73,76,116,1)_80%)]'>
            {navigationAnchors.map(({ href, name }) => (
              <DialogPrimitive.Close asChild key={href}>
                <a href={href} className='py-1 font-medium'>
                  {name}
                </a>
              </DialogPrimitive.Close>
            ))}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Dialog>
  )
}

function useIsWindowScrolled() {
  const [isWindowScrolled, setIsWindowScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      if (window.scrollY >= 20) {
        setIsWindowScrolled(true)
      } else {
        setIsWindowScrolled(false)
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return isWindowScrolled
}
