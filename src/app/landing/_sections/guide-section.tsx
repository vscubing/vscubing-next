import { type ReactNode } from 'react'
import { Container } from '../_shared/container'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@/frontend/ui'
import { KeyMapDialogContent } from '@/frontend/shared/key-map-dialog'
import { StaticLinkToApp } from '../_shared/link-to-app'
import { LazyAutoplayVideo } from '../_shared/lazy-autoplay-video'

export function GuideSection({ id }: { id: string }) {
  return (
    <Container>
      <section id={id} className='landing-offset-anchor'>
        <h2 className='landing-h2 mb-14 text-center'>
          Three easy steps to get started
        </h2>
        <div className='grid grid-flow-col grid-cols-2 grid-rows-[repeat(3,auto)] gap-3 lg:mx-auto lg:max-w-[40rem] lg:grid-cols-1 lg:grid-rows-[repeat(4,auto)]'>
          <ul className='contents'>
            <StepsListItem
              number={1}
              title='Master the basics'
              text={
                <>
                  If you don't know how to solve Rubik&apos;s Cube, start by
                  watching{' '}
                  <a className='text-primary-60 hover:underline'>
                    the Rubik's Cube tutorial
                  </a>{' '}
                  to brush up on your skills
                </>
              }
            />
            <StepsListItem
              number={2}
              title='Know your keys'
              text={
                <>
                  Our platform is intuitive — if you can solve a real cube, you
                  can solve a virtual one.
                  <br />
                  <KeyMapDialogTrigger className='text-primary-60 hover:underline'>
                    Check the keymap
                  </KeyMapDialogTrigger>{' '}
                  to learn the controls
                </>
              }
            />
            <StepsListItem
              number={3}
              title='Practice regularly'
              text={
                <>
                  <a
                    className='text-primary-60 hover:underline'
                    href='https://cstimer.net/'
                  >
                    Use csTimer
                  </a>{' '}
                  for regular practice sessions, to track progress, and improve
                  your skills. <br />
                  Also{' '}
                  <a
                    className='text-primary-60 hover:underline'
                    href='https://youtube.com/clip/UgkxcFC_Cw_ea1xKLOjcfLbNJMXjIOaAbcMZ?si=i2qFLqXnyFZW4dNA'
                  >
                    check out the guide
                  </a>{' '}
                  for enabling the virtual cube mode in csTimer
                </>
              }
            />
          </ul>
          <div className='row-span-3 flex flex-col items-center justify-end gap-14 lg:row-span-1 lg:pt-12'>
            <LazyAutoplayVideo
              thumbnail='/landing/videos/virtual-cube-screen-thumbnail.jpg'
              webm='/landing/videos/virtual-cube-screen.webm'
              mp4='/landing/videos/virtual-cube-screen.mp4'
              width={380}
            />
            <StaticLinkToApp className='h-[4.5rem] px-[4.625rem] sm:h-[4.5rem]' />
          </div>
        </div>
      </section>
    </Container>
  )
}

function StepsListItem({
  number,
  title,
  text,
}: {
  number: number
  title: string
  text: ReactNode
}) {
  return (
    <li className='flex gap-10 rounded-3xl py-10 pl-10 pr-[6.25rem] [background:linear-gradient(90deg,rgba(6,7,9,1)_15%,rgba(73,76,116,1)_100%)] sm:flex-col sm:items-start sm:pr-10'>
      <span className='font-outline-2 shrink-0 basis-[4.625rem] text-center font-kanit text-[8.75rem] leading-[.75] text-transparent [-webkit-text-stroke:_1px_#8F8FFE]'>
        {number}
      </span>
      <div>
        <h3 className='landing-h3 mb-4'>{title}</h3>
        <p>{text}</p>
      </div>
    </li>
  )
}

function KeyMapDialogTrigger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className='bg-black-1000/50' withCubes={false} />
        <KeyMapDialogContent />
      </DialogPortal>
    </Dialog>
  )
}
