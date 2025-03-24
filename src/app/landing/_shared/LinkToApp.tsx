"use client";

import { PrimaryButton } from "@/app/_components/ui";
import { cn } from "@/app/_utils/cn";
import Link from "next/link";
import { useEffect, useState } from "react";

export function StaticLinkToApp({ className }: { className?: string }) {
  return (
    <PrimaryButton asChild data-static-link-to-app className={className}>
      <Link href="/">Start cubing now</Link>
    </PrimaryButton>
  );
}

export function DynamicLinkToApp({ className }: { className?: string }) {
  const [isAnyStaticLinkVisible, setIsAnyStaticLinkVisible] =
    useState<boolean>(true);
  const showDynamicLink = !isAnyStaticLinkVisible;

  useEffect(() => {
    const staticLinks = document.querySelectorAll("[data-static-link-to-app]");
    const observer = new IntersectionObserver(
      (entries) =>
        setIsAnyStaticLinkVisible(entries.some((e) => e.isIntersecting)),
      { rootMargin: "-72px 0px 0px", threshold: 0 },
    );
    staticLinks.forEach((elem) => observer.observe(elem));
    return () => staticLinks.forEach((elem) => observer.unobserve(elem));
  }, []);

  return (
    <PrimaryButton
      asChild
      className={cn(
        "transition-base",
        { "pointer-events-none opacity-0": !showDynamicLink },
        className,
      )}
    >
      <Link href="/">Start cubing now</Link>
    </PrimaryButton>
  );
}
