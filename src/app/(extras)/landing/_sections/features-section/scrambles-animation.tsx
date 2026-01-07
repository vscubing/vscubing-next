import { AnimationItem } from './animations'

export function ScramblesAnimation() {
  return (
    <div className='relative h-full'>
      <AnimationItem
        block='scrambles'
        className='absolute right-12 top-[40%] animate-landing-features-scrambles whitespace-nowrap text-[2rem] text-grey-20 sm:left-0 sm:right-auto sm:text-[1.25rem]'
      >
        {"R' B U L' U' D2 R' U D2 B' U2 D2 L2 F'"}
      </AnimationItem>
    </div>
  )
}
