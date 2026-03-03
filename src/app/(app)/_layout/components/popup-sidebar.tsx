'use client'

import { useAtom } from 'jotai'
import { mobileMenuOpenAtom } from '../store/mobile-menu-open-atom'
import { Drawer } from 'vaul'
import { Sidebar } from './sidebar'

export function PopupSidebar() {
  const [open, setOpen] = useAtom(mobileMenuOpenAtom)

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction='right'
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className='bg-black-1000/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0' />
        <Drawer.Content
          className='fixed top-0 right-0 bottom-0'
          aria-describedby={undefined}
        >
          <Drawer.Title className='sr-only'>Navigation menu</Drawer.Title>
          <Sidebar className='bg-black-100 h-full w-full p-[1.625rem] sm:w-screen sm:p-3' />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
