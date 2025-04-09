import { Container } from '../../_shared/container'
import {
  LeaderboardIcon,
  ResultIcon,
  ScrambleIcon,
  ShareIcon,
} from '../../_shared/icons'
import { AnimationsController, BlockIntersectionWrapper } from './animations'
import { ResultsAnimation } from './results-animation'
import { ScramblesAnimation } from './scrambles-animation'
import { LeaderboardsAnimation } from './leaderboards-animation'
import { SharingAnimation } from './sharing-animation'
import type { ReactNode } from 'react'

export type BlockType = 'results' | 'scrambles' | 'leaderboards' | 'sharing'
export function FeaturesSection({
  className,
  id,
}: {
  className: string
  id: string
}) {
  return (
    <Container className={className}>
      <section id={id} className='landing-offset-anchor'>
        <h2 className='landing-h2 mb-14 text-center'>The problem we solve</h2>
        <AnimationsController>
          <ul className='grid grid-cols-2 justify-center gap-3 lg:mx-auto lg:max-w-[40rem] lg:grid-cols-1 lg:grid-rows-[repeat(4,1fr)]'>
            <BlockIntersectionWrapper block='results'>
              <Feature
                title='Automated results'
                description='No more manual entering of results in Excel. Everything is automated!'
                icon={<ResultIcon />}
                visualization={<ResultsAnimation />}
              />
            </BlockIntersectionWrapper>
            <BlockIntersectionWrapper block='scrambles'>
              <Feature
                title='Instant scrambles'
                description='Get your scrambles without any manual copy-pasting.'
                icon={<ScrambleIcon />}
                visualization={<ScramblesAnimation />}
              />
            </BlockIntersectionWrapper>
            <BlockIntersectionWrapper block='leaderboards'>
              <Feature
                title='Leaderboards'
                description='Compete for top spots on both contest-wise and all-time leaderboards.'
                icon={<LeaderboardIcon />}
                visualization={<LeaderboardsAnimation />}
              />
            </BlockIntersectionWrapper>
            <BlockIntersectionWrapper block='sharing'>
              <Feature
                title='Share your solves'
                description='Easily share your solves with friends and challenge them to beat your time!'
                icon={<ShareIcon />}
                visualization={<SharingAnimation />}
              />
            </BlockIntersectionWrapper>
          </ul>
        </AnimationsController>
      </section>
    </Container>
  )
}

function Feature({
  title,
  description,
  icon,
  visualization,
}: {
  title: string
  description: string
  icon: ReactNode
  visualization: ReactNode
}) {
  return (
    <li className='flex h-[18.75rem] flex-col overflow-clip rounded-3xl bg-black-100 px-10 pb-10 sm:h-[26rem] sm:w-auto sm:p-6'>
      <div className='flex flex-1 gap-28 sm:flex-col-reverse sm:gap-8'>
        <div className='self-end pb-6 sm:self-start'>{icon}</div>
        <div className='-mb-2 -ml-2 -mr-10 flex-1 sm:mb-0 sm:ml-0 sm:mr-0'>
          {visualization}
        </div>
      </div>
      <h3 className='landing-h3 mb-2'>{title}</h3>
      <p>{description}</p>
    </li>
  )
}
