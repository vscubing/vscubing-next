'use client'

import { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import * as Sonner from 'sonner'
import cookieImage from '@/../public/images/cookie.svg'
import Image from 'next/image'
import { CloseIcon } from './ui'

const COOKIE_BANNER_TOAST_ID = 'cookie-banner'

export function CookieBannerHandler() {
  const [seenCookieBanner, setSeenCookieBanner] = useLocalStorage(
    'vs-seenCookieBanner',
    false,
  )

  useEffect(() => {
    if (!seenCookieBanner) {
      Sonner.toast.custom(
        () => (
          <CookieBanner
            onDismiss={() => Sonner.toast.dismiss(COOKIE_BANNER_TOAST_ID)}
          />
        ),
        {
          duration: Infinity,
          onDismiss: () => setSeenCookieBanner(true),
          id: COOKIE_BANNER_TOAST_ID,
        },
      )
    }
  }, [seenCookieBanner, setSeenCookieBanner])

  return
}

function CookieBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className='relative rounded-3xl p-10 [background:linear-gradient(128deg,rgba(54,60,64,1)16%,rgba(27,30,37,1)80%)] sm:p-6'>
      <Image src={cookieImage} alt='cookie' className='mx-auto mb-4' />
      <h2 className='landing-h3 pb-4 text-white-100'>
        We respect your privacy, speedcuber!
      </h2>
      <p className='font-hind text-[1rem] leading-[1.4] text-grey-40'>
        vscubing.com doesn’t use third-party cookies, only in-house cookies for
        authentication.
      </p>
      <button
        className='absolute right-4 top-4 p-2'
        onClick={() => onDismiss()}
      >
        <CloseIcon className='w-4 text-grey-40' />
      </button>
    </div>
  )
}
