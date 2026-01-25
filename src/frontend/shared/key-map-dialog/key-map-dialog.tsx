'use client'

import {
  DialogCloseCross,
  DialogContent,
  DialogTrigger,
  UnderlineButton,
} from '@/frontend/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/frontend/utils/cn'
import { type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import { KEY_MAP } from '.'

export function KeyMapDialogTrigger({
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof UnderlineButton> & {
  ref?: React.RefObject<ComponentRef<typeof UnderlineButton>>
}) {
  return (
    <DialogTrigger asChild>
      <UnderlineButton size='sm' {...props} ref={ref}>
        Virtual Cube Key Map
      </UnderlineButton>
    </DialogTrigger>
  )
}

export function KeyMapDialogContent({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogContent> & {
  ref?: React.RefObject<ComponentRef<typeof DialogContent>>
}) {
  return (
    <DialogContent
      className={cn('max-w-none gap-8 p-10 sm:gap-6', className)}
      {...props}
      ref={ref}
      aria-describedby={undefined}
    >
      <div className='grid grid-cols-[repeat(10,auto)] gap-1'>
        <div className='col-span-full flex items-center justify-between rounded-xl bg-black-80 p-4'>
          <DialogPrimitive.Title className='title-h2 text-secondary-20'>
            Virtual Cube Key Map
          </DialogPrimitive.Title>
          <DialogCloseCross />
        </div>

        <ul className='contents'>
          {KEY_MAP.map(({ keyName, cubeMovement }) => (
            <KeyMapTile
              key={keyName}
              keyName={keyName}
              cubeMovement={cubeMovement}
            />
          ))}
        </ul>
      </div>
    </DialogContent>
  )
}

export function KeyMapTile({
  keyName,
  cubeMovement,
  className,
}: (typeof KEY_MAP)[number] & { className?: string }) {
  return (
    <li
      className={cn(
        'title-h3 flex h-[4.625rem] w-[4.625rem] flex-col justify-between rounded-xl bg-black-80 px-3 py-1',
        className,
      )}
      aria-hidden={!cubeMovement}
    >
      <span className='text-grey-20'>{keyName}</span>
      <span className='text-end text-white-100'>{cubeMovement}</span>
    </li>
  )
}
