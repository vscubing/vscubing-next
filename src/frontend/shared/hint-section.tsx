import { SignInButton } from './sign-in-button'

export function HintSection({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative flex flex-1 flex-col overflow-y-clip rounded-2xl bg-black-80 p-6 sm:p-0'>
      <div className='absolute inset-0 h-full w-full bg-cubes bg-cover bg-bottom opacity-40 sm:hidden'></div>
      <div className='title-h3 bg-card-gradient flex min-h-72 flex-col items-center justify-center space-y-10 rounded-xl px-[15%] text-center md:px-[5%] sm:flex-1 sm:justify-start sm:space-y-6 sm:px-3 sm:py-10'>
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
    </div>
  )
}

export function HintSignInSection({
  description = 'You have to be signed in to view this page',
}: {
  description?: string
}) {
  return (
    <HintSection>
      <p>{description}</p>
      <SignInButton variant='primary' className='sm:mt-3 sm:self-stretch' />
    </HintSection>
  )
}
