import { cn } from "@/app/_utils/cn";

export function ExtraLabel({
  scramblePosition,
  className,
}: {
  scramblePosition: string;
  className?: string;
}) {
  if (!scramblePosition.startsWith("E")) {
    return null;
  }
  const extraNumber = scramblePosition[1];
  return (
    <span className={cn("caption-sm text-red-80", className)}>
      Extra {extraNumber}
    </span>
  );
}
