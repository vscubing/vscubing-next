'use client'

import separateLimeCube from '@/../public/images/not-found/separate-lime-cube.svg'
import separatePurpleCube from '@/../public/images/not-found/separate-purple-cube.svg'
import blackCube from '@/../public/images/not-found/black-cube.svg'
import blueCube from '@/../public/images/not-found/blue-cube.svg'
import greenCube from '@/../public/images/not-found/green-cube.svg'
import whiteCube from '@/../public/images/not-found/white-cube.svg'
import whiteSmCube from '@/../public/images/not-found/white-sm-cube.svg'
import {
  MouseParallaxChild,
  MouseParallaxContainer,
} from 'react-parallax-mouse'
import { type ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'

type ParallaxCubesProps = {
  children: ReactNode
}
export function ParallaxCubesWrapper({ children }: ParallaxCubesProps) {
  return (
    <MouseParallaxContainer
      globalFactorX={0.022}
      globalFactorY={0.02}
      className='contents'
    >
      {children}
    </MouseParallaxContainer>
  )
}

export function ParallaxCubes({
  mainImgSrc,
  mainImgAlt,
}: {
  mainImgSrc: StaticImageData | string
  mainImgAlt: string
}) {
  return (
    <div className='absolute inset-0 overflow-clip'>
      <MouseParallaxChild
        factorX={1.1}
        factorY={1.1}
        className='pointer-events-none absolute bottom-[15%] left-[10%]'
      >
        <Image src={separateLimeCube} alt='' />
      </MouseParallaxChild>
      <MouseParallaxChild
        factorX={1.3}
        factorY={1.3}
        className='pointer-events-none absolute left-[10%] top-[max(40%,20rem)]'
      >
        <Image src={separatePurpleCube} alt='' />
      </MouseParallaxChild>
      <div className='pointer-events-none absolute left-1/2 top-[55%] aspect-square w-[min(80%,80vh)] -translate-x-1/2 -translate-y-1/2'>
        <MouseParallaxChild
          factorX={1.5}
          factorY={1.5}
          className='absolute right-[2%] top-[55%] w-[18%]'
        >
          <Image
            src={whiteSmCube}
            alt=''
            className='h-full w-full brightness-[60%]'
          />
        </MouseParallaxChild>
        <MouseParallaxChild className='absolute bottom-[5%] left-[30%] w-[21%]'>
          <Image
            src={blackCube}
            alt=''
            className='h-full w-full brightness-[60%]'
          />
        </MouseParallaxChild>
        <MouseParallaxChild
          factorX={0.8}
          factorY={0.8}
          className='absolute bottom-[3%] left-[40%] w-[37%]'
        >
          <Image
            src={blueCube}
            alt=''
            className='h-full w-full brightness-[60%]'
          />
        </MouseParallaxChild>
        <MouseParallaxChild
          factorX={1.2}
          factorY={1.2}
          className='absolute left-[25%] top-[40%] w-[40%]'
        >
          <Image
            src={whiteCube}
            alt=''
            className='h-full w-full brightness-[60%]'
          />
        </MouseParallaxChild>
        <MouseParallaxChild
          factorX={0.5}
          factorY={0.5}
          className='absolute right-0 top-0 w-[67%]'
        >
          <Image
            src={greenCube}
            alt=''
            className='h-full w-full brightness-[60%]'
          />
        </MouseParallaxChild>
        <MouseParallaxChild
          factorX={2}
          factorY={4}
          className='pointer-events-auto absolute left-1/2 top-[40%] w-[80%]'
        >
          <Image
            src={mainImgSrc}
            alt={mainImgAlt}
            className='h-full w-full -translate-x-1/2'
          />
        </MouseParallaxChild>
      </div>
    </div>
  )
}
