import { CubeIcon, KeyboardIcon } from '../_shared/icons'
import { Container } from '../_shared/Container'
import { LazyAutoplayVideo } from '../_shared/LazyAutoplayVideo'

export function AboutSection({
  className,
  id,
}: {
  className: string
  id: string
}) {
  return (
    <Container className={className}>
      <section className='landing-offset-anchor mx-auto max-w-[75rem]' id={id}>
        <h2 className='landing-h2 mb-14 text-center'>
          What is virtual speedcubing?
        </h2>
        <div className='mx-auto mb-12 flex justify-center gap-40 px-4 lg:gap-3 md:max-w-[33.5rem] md:flex-col'>
          <div className='flex items-center gap-2 sm:flex-col sm:items-start'>
            <CubeIcon className='flex-shrink-0' />
            <p>
              Speedcubing is an art of solving a Rubik's Cube as fast as
              possible. It’s a thrilling sport that challenges your mind and
              dexterity
            </p>
          </div>
          <div className='flex max-w-[30rem] items-center gap-2 sm:flex-col sm:items-start'>
            <KeyboardIcon className='flex-shrink-0' />
            <p>
              Virtual speedcubing brings this excitement to your computer,
              allowing you to compete with others worldwide, anytime, anywhere
            </p>
          </div>
        </div>
        <LazyAutoplayVideo
          width='100%'
          className='min-h-[19rem] rounded-3xl object-cover'
          replayable
          thumbnail='/landing/videos/virtual-cube-laptop-thumbnail.jpg'
          webm='/landing/videos/virtual-cube-laptop.webm'
          mp4='/landing/videos/virtual-cube-laptop.mp4'
        />
      </section>
    </Container>
  )
}
