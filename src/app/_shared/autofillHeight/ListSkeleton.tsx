import { type ReactNode } from "react";
import { useFittingCount } from "./useAutofillHeight";

export function ListSkeleton({
  renderSkeletonItem,
  className,
}: {
  renderSkeletonItem: () => ReactNode;
  className?: string;
}) {
  const { fittingCount, containerRef, fakeElementRef } = useFittingCount();
  return (
    <ul ref={containerRef} className={className}>
      <li aria-hidden className="invisible fixed" ref={fakeElementRef}>
        {renderSkeletonItem()}
      </li>
      {fittingCount &&
        Array.from({ length: fittingCount }).map(() => renderSkeletonItem())}
    </ul>
  );
}
