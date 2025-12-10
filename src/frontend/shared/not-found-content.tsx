import Link from 'next/link'
import { PrimaryButton } from '../ui'
import { ParallaxCubes, ParallaxCubesWrapper } from './parallax-cubes'
import img404 from '@/../public/images/404.svg'

export const NotFoundWrapper = ParallaxCubesWrapper // NOTE: this is needed to make parallax react on cursor changes over <Layout/>

export function NotFoundContent() {
  return (
    <div className='flex flex-1 flex-col gap-3 sm:gap-0'>
      <div className='relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8'>
        <ParallaxCubes mainImgSrc={img404} mainImgAlt='404' />
        <div className='relative max-w-[35rem] sm:max-w-none'>
          <p className='title-lg mb-4'>Lost in cuberspace?</p>
          <p className='mb-8 inline-block text-base'>
            Sorry, the page you're looking for seems to have gone on a digital
            adventure of its own
          </p>
          <Link href='/'>
            <PrimaryButton className='sm:hidden'>
              Go back to dashboard
            </PrimaryButton>
            <PrimaryButton className='hidden sm:block sm:w-full' size='sm'>
              Go back to dashboard
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
