'use client'

import { Layout } from './(main)/_layout'
import { PrimaryButton } from './_components/ui'
import { ParallaxCubes, ParallaxCubesWrapper } from './_parallax-cubes'
import { useMatchesScreen } from './_utils/tailwind'
import img500 from '@/../public/images/500.svg'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isSmScreen = useMatchesScreen('sm')

  return (
    <ParallaxCubesWrapper>
      <Layout withoutHeader>
        <div className='flex flex-1 flex-col gap-3 sm:gap-0'>
          <div className='relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8'>
            <ParallaxCubes mainImgSrc={img500} mainImgAlt='505' />
            <div className='relative max-w-[35rem] sm:max-w-none'>
              <p className='title-lg mb-4'>
                Oops!
                <br />
                Technical glitch detected
              </p>
              <p className='text-large mb-8'>{error.message}</p>
              <PrimaryButton
                className='sm:w-full'
                size={isSmScreen ? 'sm' : 'lg'}
                onClick={reset}
              >
                Retry
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Layout>
    </ParallaxCubesWrapper>
  )
}
