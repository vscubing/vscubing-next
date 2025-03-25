import { Container } from '../_shared/Container'
import cstimerLogo from '@/../public/landing/cstimer-logo.png'
import cubingjsLogo from '@/../public/landing/cubingjs-logo.png'
import sportcubingLogo from '@/../public/landing/sportcubing-logo.png'
import Image from 'next/image'
import type { ReactNode } from 'react'

export function AcknowledgmentsSection() {
  return (
    <Container>
      <section>
        <h2 className='landing-h2 mb-4 text-center'>Acknowledgments</h2>
        <p className='mb-14 text-center sm:mb-10'>
          Special thanks to the incredible tools and platforms that power our
          project
        </p>
        <div className='grid grid-cols-3 gap-3 md:mx-auto md:max-w-[40rem] md:grid-cols-1'>
          <Acknowledgment
            name='csTimer'
            link='https://csTimer.net'
            img={
              <Image
                src={cstimerLogo.src}
                alt='csTimer'
                width={35}
                height={35}
              />
            }
            description='The heartbeat of our solving simulator'
          />
          <Acknowledgment
            name='cubing.js'
            link='https://js.cubing.net/cubing'
            img={
              <Image
                src={cubingjsLogo.src}
                alt='cubing.js'
                width={40}
                height={40}
              />
            }
            description='Bringing our puzzle replays to life'
          />
          <Acknowledgment
            name='sportcubing.in.ua'
            link='https://sportcubing.in.ua'
            img={
              <Image
                src={sportcubingLogo.src}
                alt='sportcubing.in.ua'
                width={45}
                height={45}
              />
            }
            description='Our guiding light in the cubing world'
          />
        </div>
      </section>
    </Container>
  )
}

function Acknowledgment({
  name,
  link,
  img,
  description,
}: {
  name: string
  link: string
  img: ReactNode
  description: string
}) {
  return (
    <div className='rounded-3xl bg-black-100 p-10 sm:p-6'>
      <a href={link} className='group mb-4 inline-flex items-end gap-2'>
        <span className='flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-2xl bg-white-100'>
          {img}
        </span>
        <span className='text-primary-60 group-hover:underline'>{name}</span>
      </a>
      <p>{description}</p>
    </div>
  )
}
