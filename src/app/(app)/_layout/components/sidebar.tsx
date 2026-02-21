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
      <div className='flex h-[7rem] xl-short:h-[var(--header-height)] lg:h-[var(--header-height)] lg:gap-3'>
        <ControlMobileMenuButton
          mode={false}
          className='hidden h-[4.375rem] w-[4.375rem] flex-shrink-0 items-center justify-center rounded-2xl bg-black-80 sm:flex sm:h-14 sm:w-14'
        >
          <CloseIcon />
        </ControlMobileMenuButton>
        <LogoHomeLink
          className='flex w-full items-center rounded-2xl bg-black-80 px-4 lg:hidden sm:flex sm:px-4'
          variant='full'
        />
        <Link
          href='/'
          className='hidden aspect-square h-full items-center justify-center rounded-2xl bg-black-80 lg:flex sm:hidden'
        >
          <Logo className='inline-block h-12 w-12' variant='sm' />
        </Link>
      </div>
      <div className='flex flex-1 flex-col rounded-2xl bg-black-80 py-6 sm:py-3'>
        <Navbar variant='vertical' />
        <SocialLinks className='mb-4 mt-auto' />
        <Link href='/privacy-policy' className='mb-4 text-center text-grey-40'>
          Privacy Policy
        </Link>
        <div className='flex justify-center border-t border-grey-80 pt-2'>
          <Link href='https://u24.gov.ua/about'>
            <Image
              className='lg:hidden sm:block'
              alt='Stand with Ukraine'
              src={standWithUkraineImg}
            />
            <Image
              className='hidden lg:inline-block sm:hidden'
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
        'flex justify-center gap-4 xl-short:gap-1 lg:flex-col lg:items-center sm:flex-row sm:items-stretch',
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
          className='transition-base outline-ring flex h-11 w-11 items-center justify-center text-[1.5rem] text-grey-20 hover:text-primary-80'
          target='_blank'
        >
          {children}
        </Link>
      ))}
    </div>
  )
}
