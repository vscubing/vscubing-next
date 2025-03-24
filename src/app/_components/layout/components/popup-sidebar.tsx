"use client";

import { useAtom } from "jotai";
import { mobileMenuOpenAtom } from "../store/mobileMenuOpenAtom";
import { Drawer } from "vaul";
import { Sidebar } from "./sidebar";

export function PopupSidebar() {
  const [open, setOpen] = useAtom(mobileMenuOpenAtom);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction="right"
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black-1000/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Drawer.Content
          className="fixed bottom-0 right-0 top-0"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Navigation menu</Drawer.Title>
          <Sidebar className="h-full w-full bg-black-100 p-[1.625rem] sm:w-screen sm:p-3" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
