import { cn } from '@/frontend/utils/cn'
import { type CSSProperties } from 'react'
import { AnimationItem } from './animations'

export function ResultsAnimation() {
  return (
    <div className='relative -ml-16 h-full sm:min-w-[28rem] sm:scale-[60%]'>
      <ResultsAnimationItem
        fromRotation='18deg'
        fromLeft='-13%'
        fromTop='-100%'
        transitionRotation='-31deg'
        transitionLeft='-11%'
        transitionTop='30%'
        toRotation='11deg'
        toLeft='-8%'
        toTop='46%'
      >
        Average time
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='-9.5deg'
        fromLeft='35%'
        fromTop='-75%'
        transitionRotation='41.5deg'
        transitionLeft='38%'
        transitionTop='57%'
        toRotation='-13deg'
        toLeft='34%'
        toTop='72%'
      >
        Single time
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='10.5deg'
        fromLeft='17%'
        fromTop='-120%'
        transitionRotation='-58deg'
        transitionLeft='17%'
        transitionTop='18%'
        toRotation='30deg'
        toLeft='24%'
        toTop='39%'
      >
        Attempt 1
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='-21.5deg'
        fromLeft='5%'
        fromTop='-60%'
        transitionRotation='29deg'
        transitionLeft='10%'
        transitionTop='68%'
        toRotation='-22deg'
        toLeft='11%'
        toTop='70%'
      >
        Attempt 2
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='22deg'
        fromLeft='65%'
        fromTop='-50%'
        transitionRotation='-20deg'
        transitionLeft='67%'
        transitionTop='55%'
        toRotation='16deg'
        toLeft='71%'
        toTop='68%'
      >
        Attempt 3
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='-21.5deg'
        fromLeft='50%'
        fromTop='-120%'
        transitionRotation='45deg'
        transitionLeft='42%'
        transitionTop='15%'
        toRotation='32deg'
        toLeft='48%'
        toTop='47%'
      >
        Attempt 4
      </ResultsAnimationItem>
      <ResultsAnimationItem
        fromRotation='42deg'
        fromLeft='69%'
        fromTop='-88%'
        transitionRotation='-16.5deg'
        transitionLeft='68%'
        transitionTop='6%'
        toRotation='-16.5deg'
        toLeft='70%'
        toTop='31%'
      >
        Attempt 5
      </ResultsAnimationItem>
    </div>
  )
}

function ResultsAnimationItem(
  props: Record<
    | 'fromLeft'
    | 'fromTop'
    | 'fromRotation'
    | 'transitionLeft'
    | 'transitionTop'
    | 'transitionRotation'
    | 'toLeft'
    | 'toTop'
    | 'toRotation',
    string
  > & {
    children: string
  },
) {
  return (
    <AnimationItem
      block='results'
      style={
        {
          '--from-left': props.fromLeft,
          '--from-top': props.fromTop,
          '--from-rotation': props.fromRotation,
          '--transition-left': props.transitionLeft,
          '--transition-top': props.transitionTop,
          '--transition-rotation': props.transitionRotation,
          '--to-left': props.toLeft,
          '--to-top': props.toTop,
          '--to-rotation': props.toRotation,
        } as CSSProperties
      }
      className={cn(
        'absolute animate-landing-features-results whitespace-nowrap rounded-3xl border border-secondary-20 px-6 py-2 text-[0.875rem] text-grey-20',
      )}
    >
      <div className='mb-[-.1em] pt-[.1em]'>{props.children}</div>
    </AnimationItem>
  )
}
