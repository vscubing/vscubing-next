import { AnimationItem } from './animations'

export function ScramblesAnimation() {
  return (
    <div className='relative h-full'>
      <AnimationItem
        block='scrambles'
        className='animate-landing-features-scrambles text-grey-20 absolute top-[40%] right-12 text-[2rem] whitespace-nowrap sm:right-auto sm:left-0 sm:text-[1.25rem]'
      >
        {"R' B U L' U' D2 R' U D2 B' U2 D2 L2 F'"}
      </AnimationItem>
    </div>
  )
}
