import {
  DialogCloseCross,
  DialogContent,
  DialogTrigger,
  UnderlineButton,
} from '@/app/_components/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/app/_utils/cn'
import {
  type ElementRef,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react'
import { KEY_MAP } from '.'

export const KeyMapDialogTrigger = forwardRef<
  ElementRef<typeof UnderlineButton>,
  ComponentPropsWithoutRef<typeof UnderlineButton>
>((props, ref) => (
  <DialogTrigger asChild>
    <UnderlineButton size='sm' {...props} ref={ref}>
      Virtual Cube Key Map
    </UnderlineButton>
  </DialogTrigger>
))

export const KeyMapDialogContent = forwardRef<
  ElementRef<typeof DialogContent>,
  ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    className={cn('max-w-none p-10', className)}
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
))

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
