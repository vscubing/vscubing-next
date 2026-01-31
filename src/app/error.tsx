'use client'

import { env } from '@/env'
import { PrimaryButton, SecondaryButton } from '../frontend/ui'
import {
  ParallaxCubes,
  ParallaxCubesWrapper,
} from '../frontend/shared/parallax-cubes'
import { useMatchesScreen } from '../frontend/utils/tailwind'
import img500 from '@/../public/images/500.svg'
import Layout from './(app)/layout'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isSmScreen = useMatchesScreen('sm')

  if (env.NEXT_PUBLIC_APP_ENV === 'development') {
    if (
      error.message ===
      'An error occurred in the Server Components render but no message was provided'
    )
      error.message =
        'You probably forgot to start the database. To start a local database, run `bun run db:local` or `./start-database`'

    if (error.message.includes('relation'))
      error.message +=
        '. You probably have unapplied migrations. To apply them, run `bun run db:migrate`'
  }

  return (
    <ParallaxCubesWrapper>
      <Layout withoutHeader>
        <div className='flex flex-1 flex-col gap-3 sm:gap-0'>
          <div className='relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8'>
            <ParallaxCubes mainImgSrc={img500} mainImgAlt='500' />
            <div className='relative max-w-[35rem] sm:max-w-none'>
              <p className='title-lg mb-4'>
                Oops!
                <br />
                Technical glitch detected
              </p>
              <p className='mb-8 text-base'>{error.message}</p>
              <div className='flex gap-4 sm:flex-col'>
                <SecondaryButton
                  className='sm:w-full'
                  size={isSmScreen ? 'sm' : 'lg'}
                  onClick={reset}
                >
                  Retry
                </SecondaryButton>
                <PrimaryButton
                  className='sm:w-full'
                  size={isSmScreen ? 'sm' : 'lg'}
                  onClick={() =>
                    window.open('https://discord.gg/PxFrW9vTAy', '_blank')
                  }
                >
                  Contact us
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ParallaxCubesWrapper>
  )
}
