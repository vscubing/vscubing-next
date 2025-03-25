"use client";

import { type ReactNode } from "react";
import { useFittingCount } from "./useAutofillHeight";

export function AutofillHeightListSkeleton({
  skeletonItem,
  className,
}: {
  skeletonItem: ReactNode;
  className?: string;
}) {
  const { fittingCount, containerRef, fakeElementRef } = useFittingCount();
  return (
    <ul ref={containerRef} className={className}>
      <li aria-hidden className="invisible fixed" ref={fakeElementRef}>
        {skeletonItem}
      </li>
      {fittingCount &&
        Array.from({ length: fittingCount }).map(() => skeletonItem)}
    </ul>
  );
}
