import { cn } from '@/frontend/utils/cn'
import { ControlMobileMenuButton } from '../store/mobile-menu-open-atom'
import { LogoHomeLink } from './logo'
import { Navbar } from './navbar'
import Image from 'next/image'
import standWithUkraineImg from '@/../public/images/stand-with-ukraine.svg'
import standWithUkraineImgSm from '@/../public/images/stand-with-ukraine-sm.svg'
import {
  CloseIcon,
  GithubIcon,
  DiscordIcon,
  VscubingIcon,
  Logo,
} from '@/frontend/ui'
import Link from 'next/link'

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('flex flex-col gap-3', className)}>
      <div className='xl-short:h-[var(--header-height)] flex h-[7rem] lg:h-[var(--header-height)] lg:gap-3'>
        <ControlMobileMenuButton
          mode={false}
          className='bg-black-80 hidden h-[4.375rem] w-[4.375rem] flex-shrink-0 items-center justify-center rounded-2xl sm:flex sm:h-14 sm:w-14'
        >
          <CloseIcon />
        </ControlMobileMenuButton>
        <LogoHomeLink
          className='bg-black-80 flex w-full items-center rounded-2xl px-4 sm:flex sm:px-4 lg:hidden'
          variant='full'
        />
        <Link
          href='/'
          className='bg-black-80 hidden aspect-square h-full items-center justify-center rounded-2xl sm:hidden lg:flex'
        >
          <Logo className='inline-block h-12 w-12' variant='sm' />
        </Link>
      </div>
      <div className='bg-black-80 flex flex-1 flex-col rounded-2xl py-6 sm:py-3'>
        <Navbar variant='vertical' />
        <SocialLinks className='mt-auto mb-4' />
        <Link href='/privacy-policy' className='text-grey-40 mb-4 text-center'>
          Privacy Policy
        </Link>
        <div className='border-grey-80 flex justify-center border-t pt-2'>
          <Link href='https://u24.gov.ua/about'>
            <Image
              className='sm:block lg:hidden'
              alt='Stand with Ukraine'
              src={standWithUkraineImg}
            />
            <Image
              className='hidden sm:hidden lg:inline-block'
              alt='Stand with Ukraine'
              src={standWithUkraineImgSm}
            />
          </Link>
        </div>
      </div>
    </aside>
  )
}

function SocialLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'xl-short:gap-1 flex justify-center gap-4 sm:flex-row sm:items-stretch lg:flex-col lg:items-center',
        className,
      )}
    >
      {[
        {
          href: '/landing',
          ariaLabel: 'vscubing landing page',
          children: <VscubingIcon />,
        },
        {
          href: 'https://github.com/vscubing',
          ariaLabel: 'Github',
          children: <GithubIcon />,
        },
        {
          href: 'https://discord.gg/PxFrW9vTAy',
          ariaLabel: 'Discord',
          children: <DiscordIcon />,
        },
      ].map(({ href, children, ariaLabel }) => (
        <Link
          aria-label={ariaLabel}
          href={href}
          key={href}
          className='transition-base outline-ring text-grey-20 hover:text-primary-80 flex h-11 w-11 items-center justify-center text-[1.5rem]'
          target='_blank'
        >
          {children}
        </Link>
      ))}
    </div>
  )
}
