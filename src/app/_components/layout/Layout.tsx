"use client";

import { useAtom, useSetAtom } from "jotai";
import {
  PickUsernameDialog,
  LogoWithLinkToLanding,
  Navbar,
} from "./components";
import { cn } from "@/app/_utils/cn";
import { CloseIcon, DiscordIcon, GithubIcon, LinkedinIcon } from "../ui";
import { mobileMenuOpenAtom } from "./store/mobileMenuOpenAtom";
import { Drawer } from "vaul";
import standWithUkraineImg from "@/app/_assets/images/stand-with-ukraine.svg?url";
import Image from "next/image";

type LayoutProps = { children: React.ReactNode };
export function Layout({ children }: LayoutProps) {
  return (
    <>
      <PickUsernameDialog />
      <PopupSidebar />
      <div className="bg-black-100">
        <div
          vaul-drawer-wrapper="vaul-drawer-wrapper"
          className="flex h-svh gap-3 bg-black-100 p-[1.625rem] sm:flex-col sm:gap-0 sm:px-3 sm:py-0"
        >
          <Sidebar className="w-[clamp(16rem,20vw,21rem)] xl-short:min-w-[19rem] lg:sr-only" />
          <main className="flex flex-1 flex-col overflow-y-auto">
            {children}
          </main>
          <BottomNavbar className="hidden sm:block" />
        </div>
      </div>
    </>
  );
}

function Sidebar({ className }: { className?: string }) {
  const setOpenOnMobile = useSetAtom(mobileMenuOpenAtom);

  return (
    <aside className={cn("flex flex-col gap-3", className)}>
      <div className="flex h-[7rem] xl-short:h-[var(--header-height)] lg:h-[var(--header-height)] lg:gap-3">
        <button
          onClick={() => setOpenOnMobile(false)}
          className="hidden h-[4.375rem] w-[4.375rem] flex-shrink-0 items-center justify-center rounded-2xl bg-black-80 lg:flex sm:h-14 sm:w-14"
        >
          {/* TODO: fix next */}
          {/* <CloseIcon /> */}
        </button>
        <LogoWithLinkToLanding className="flex w-full rounded-2xl bg-black-80 px-4 lg:px-7 sm:px-4" />
      </div>
      <div className="flex flex-1 flex-col rounded-2xl bg-black-80 py-6 lg:py-3">
        <Navbar
          variant="vertical"
          onItemSelect={() => setOpenOnMobile(false)}
        />
        <SocialLinks className="mb-4 mt-auto" />
        <div className="flex justify-center border-t border-grey-80 pt-2">
          <a href="https://u24.gov.ua/about">
            <Image alt="Stand with Ukraine" src={standWithUkraineImg} />
          </a>
        </div>
      </div>
    </aside>
  );
}

function PopupSidebar() {
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

function BottomNavbar({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "h-[var(--mobile-bottom-nav-height)] bg-black-100",
        className,
      )}
    >
      <div className="rounded-b-xl border-b border-grey-20">
        <Navbar variant="horizontal" />
      </div>
    </div>
  );
}

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center gap-4 xl-short:gap-1", className)}>
      {[
        { href: "https://github.com/vscubing", children: <GithubIcon /> },
        {
          href: "https://www.linkedin.com/company/vscubing",
          children: <LinkedinIcon />,
        },
        { href: "https://discord.gg/PxFrW9vTAy", children: <DiscordIcon /> },
      ].map(({ href, children }) => (
        <a
          href={href}
          key={href}
          className="transition-base outline-ring flex h-11 w-11 items-center justify-center text-[1.5rem] text-grey-20 hover:text-primary-80"
          target="_blank"
        >
          {children}
        </a>
      ))}
    </div>
  );
}
