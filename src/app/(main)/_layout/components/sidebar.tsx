import { cn } from '@/app/_utils/cn'
import { ControlMobileMenuButton } from '../store/mobileMenuOpenAtom'
import { LogoWithLinkToLanding } from './logo'
import { Navbar } from './navbar'
import Image from 'next/image'
import standWithUkraineImg from '@/../public/images/stand-with-ukraine.svg'
import {
  CloseIcon,
  GithubIcon,
  LinkedinIcon,
  DiscordIcon,
} from '@/app/_components/ui'

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('flex flex-col gap-3', className)}>
      <div className='flex h-[7rem] xl-short:h-[var(--header-height)] lg:h-[var(--header-height)] lg:gap-3'>
        <ControlMobileMenuButton
          mode={false}
          className='hidden h-[4.375rem] w-[4.375rem] flex-shrink-0 items-center justify-center rounded-2xl bg-black-80 lg:flex sm:h-14 sm:w-14'
        >
          <CloseIcon />
        </ControlMobileMenuButton>
        <LogoWithLinkToLanding className='flex w-full rounded-2xl bg-black-80 px-4 lg:px-7 sm:px-4' />
      </div>
      <div className='flex flex-1 flex-col rounded-2xl bg-black-80 py-6 lg:py-3'>
        <Navbar variant='vertical' />
        <SocialLinks className='mb-4 mt-auto' />
        <div className='flex justify-center border-t border-grey-80 pt-2'>
          <a href='https://u24.gov.ua/about'>
            <Image alt='Stand with Ukraine' src={standWithUkraineImg} />
          </a>
        </div>
      </div>
    </aside>
  )
}

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center gap-4 xl-short:gap-1', className)}>
      {[
        { href: 'https://github.com/vscubing', children: <GithubIcon /> },
        {
          href: 'https://www.linkedin.com/company/vscubing',
          children: <LinkedinIcon />,
        },
        { href: 'https://discord.gg/PxFrW9vTAy', children: <DiscordIcon /> },
      ].map(({ href, children }) => (
        <a
          href={href}
          key={href}
          className='transition-base outline-ring flex h-11 w-11 items-center justify-center text-[1.5rem] text-grey-20 hover:text-primary-80'
          target='_blank'
        >
          {children}
        </a>
      ))}
    </div>
  )
}
