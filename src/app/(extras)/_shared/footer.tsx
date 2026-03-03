import {
  ChevronLeftIcon,
  DiscordIcon,
  GithubIcon,
  Logo,
  SecondaryButton,
} from '@/frontend/ui'
import { Container } from './container'
import { cn } from '@/frontend/utils/cn'
import footerBgCubes from '@/../public/landing/footer/footer-bg-cubes.svg'
import animatedCube1 from '@/../public/landing/footer/animated-cube-1.svg'
import animatedCube2 from '@/../public/landing/footer/animated-cube-2.svg'
import animatedCube3 from '@/../public/landing/footer/animated-cube-3.svg'
import animatedCube4 from '@/../public/landing/footer/animated-cube-4.svg'
import animatedCube5 from '@/../public/landing/footer/animated-cube-5.svg'
import animatedCube6 from '@/../public/landing/footer/animated-cube-6.svg'
import animatedCube7 from '@/../public/landing/footer/animated-cube-7.svg'
import animatedCube8 from '@/../public/landing/footer/animated-cube-8.svg'
import animatedCube9 from '@/../public/landing/footer/animated-cube-9.svg'
import standWithUkraineImg from '@/../public/images/stand-with-ukraine.svg'
import { type CSSProperties } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

export function Footer({ className }: { className: string }) {
  return (
    <Container className={cn('pb-[1.625rem]', className)}>
      <footer className='relative overflow-clip rounded-3xl px-[1.625rem] pt-10 pb-[1.625rem] [background:linear-gradient(180deg,#060709_0%,#494C74_100%)] sm:px-6'>
        <AnimatedBackground />

        <div
          className='relative' /* position:relative to put it over footerBgCubes */
        >
          <div className='mb-7 flex items-center justify-between'>
            <Logo variant='full' className='w-[38.5rem] sm:w-auto' />
            <SecondaryButton
              asChild
              className='h-11 w-11 px-0 sm:h-11 sm:w-11 [&>svg]:h-6 [&>svg]:w-6'
            >
              <a href='#'>
                <ChevronLeftIcon className='rotate-90' />
              </a>
            </SecondaryButton>
          </div>
          <div className='flex gap-3 pl-2 lg:flex-col lg:gap-10 lg:pl-0'>
            <div className='w-[19.125rem]'>
              <div className='mb-2'>
                <h2 className='landing-h3 mb-4'>Have questions?</h2>
                <p>Reach out to us at</p>
              </div>
              <div className='-ml-2 flex gap-2'>
                {[
                  {
                    href: 'https://github.com/vscubing',
                    children: <GithubIcon />,
                  },
                  {
                    href: 'https://discord.gg/PxFrW9vTAy',
                    children: <DiscordIcon />,
                  },
                ].map(({ href, children }) => (
                  <a
                    href={href}
                    key={href}
                    className='transition-base outline-ring text-grey-20 hover:text-primary-80 flex h-11 w-11 items-center justify-center text-[1.5rem]'
                    target='_blank'
                  >
                    {children}
                  </a>
                ))}
              </div>
            </div>
            <div className='w-[21.125rem] pt-3'>
              <h2 className='text-white-100 mb-4 font-medium'>Quick links</h2>
              <nav className='flex flex-col gap-[.8rem]'>
                {[
                  { name: 'About', href: '/landing#about' },
                  { name: 'Features', href: '/landing#features' },
                  { name: 'Guide', href: '/landing#guide' },
                ].map(({ href, name }) => (
                  <Link
                    key={href}
                    href={href}
                    className='hover:text-white-100 text-[1.125rem] font-medium'
                  >
                    {name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className='flex-1 pt-3'>
              <h2 className='text-white-100 mb-4 font-medium'>Creators</h2>
              <ul className='flex flex-col gap-[.8rem] text-[1.125rem] font-medium'>
                <li>
                  <a
                    className='hover:text-white-100'
                    href='https://www.linkedin.com/in/bohdan-chornokondratenko-98075b202/'
                  >
                    Bohdan Chornokondratenko - Frontend Developer
                  </a>
                </li>
                <li>
                  <a
                    className='hover:text-white-100'
                    href='https://www.linkedin.com/in/anton-savytskyi/'
                  >
                    Anton Savytskyi - Backend Developer
                  </a>
                </li>
                <li>
                  <a
                    className='hover:text-white-100'
                    href='https://www.linkedin.com/in/olesiapetryk/'
                  >
                    Olesia Petryk - UX/UI Designer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='mt-6 flex items-center justify-between pl-2 lg:mt-8 lg:pl-0'>
            <Link
              href='/privacy-policy'
              className='hover:text-white-100 text-[1.125rem] font-medium'
            >
              Privacy Policy
            </Link>
            <a href='https://u24.gov.ua/about'>
              <Image src={standWithUkraineImg} alt='Stand with Ukraine' />
            </a>
          </div>
        </div>
      </footer>
    </Container>
  )
}

function AnimatedBackground() {
  return (
    <div className='sm:hidden'>
      <Image
        src={footerBgCubes}
        alt=''
        className='pointer-events-none absolute right-[-3rem] bottom-0 max-w-max md:bottom-[-1rem] lg:right-[-4rem]'
      />
      <AnimatedCube
        src={animatedCube1}
        className='bottom-[-7.5rem] left-[-3.8rem] md:hidden'
        toTranslateY='-10%'
      />
      <AnimatedCube
        src={animatedCube2}
        className='bottom-0 left-[26%] md:hidden'
        toTranslateY='35%'
      />
      <AnimatedCube
        src={animatedCube3}
        className='bottom-[-10.5rem] left-[40%] md:bottom-[-12rem] md:left-[-6rem] lg:left-[30%]'
        toTranslateY='-10%'
      />
      <AnimatedCube
        src={animatedCube4}
        className='bottom-[-16.5rem] left-[56%] md:left-[6rem]'
        toTranslateY='-7%'
      />
      <AnimatedCube
        src={animatedCube5}
        className='bottom-[1rem] left-[65%] md:left-[35%] lg:left-[50%]'
        toTranslateY='35%'
      />
      <AnimatedCube
        src={animatedCube6}
        className='right-[12rem] bottom-[3.5rem]'
        toTranslateY='35%'
      />
      <AnimatedCube
        src={animatedCube7}
        className='right-[1rem] bottom-[-1rem] md:right-[-1rem]'
        toTranslateY='-30%'
      />
      <AnimatedCube
        src={animatedCube8}
        className='top-[2.5rem] right-[10rem] md:right-[6rem] lg:top-auto lg:right-[25rem] lg:bottom-[13rem]'
        toTranslateY='10%'
      />
      <AnimatedCube
        src={animatedCube9}
        className='top-[0] right-[.2rem] md:right-[-3rem] lg:top-auto lg:right-[15rem] lg:bottom-[14rem]'
        toTranslateY='15%'
      />
    </div>
  )
}

function AnimatedCube({
  src,
  className,
  toTranslateY,
}: {
  src: StaticImageData | string
  className: string
  toTranslateY: string
}) {
  return (
    <Image
      src={src}
      alt=''
      className={cn(
        'animate-landing-footer-cubes pointer-events-none absolute',
        className,
      )}
      style={{ '--toTranslateY': toTranslateY } as CSSProperties}
    />
  )
}
