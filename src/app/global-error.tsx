'use client'

import { env } from '@/env'
import { PrimaryButton, SecondaryButton } from '../frontend/ui'
import {
  ParallaxCubes,
  ParallaxCubesWrapper,
} from '../frontend/shared/parallax-cubes'
import { useMatchesScreen } from '../frontend/utils/tailwind'
import img500 from '@/../public/images/500.svg'
import Link from 'next/link'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
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
    <html>
      <body>
        <ParallaxCubesWrapper>
          <div className='flex h-screen flex-1 flex-col gap-3 sm:gap-0'>
            <div className='relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8'>
              <ParallaxCubes mainImgSrc={img500} mainImgAlt='505' />
              <div className='relative max-w-[35rem] sm:max-w-none'>
                <p className='title-lg mb-4'>
                  Oops!
                  <br />
                  Technical glitch detected
                </p>
                <p className='mb-8 text-base'>{error.message}</p>

                <div className='flex gap-2 sm:flex-col'>
                  <PrimaryButton
                    className='sm:w-full'
                    size={isSmScreen ? 'sm' : 'lg'}
                    asChild
                  >
                    <Link href='https://discord.gg/PxFrW9vTAy' target='_blank'>
                      Contact us
                    </Link>
                  </PrimaryButton>
                  <SecondaryButton
                    className='sm:w-full'
                    size={isSmScreen ? 'sm' : 'lg'}
                    asChild
                  >
                    <Link href='/'>Go to dashboard</Link>
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </ParallaxCubesWrapper>
      </body>
    </html>
  )
}
