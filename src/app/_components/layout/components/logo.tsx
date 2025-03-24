import { cn } from "@/app/_utils/cn";
import { Logo } from "@/app/_components/ui";
import Link from "next/link";

type LogoProps = {
  variant?: "full" | "sm";
  className?: string;
};
export function LogoWithLinkToLanding({
  variant = "full",
  className,
}: LogoProps) {
  return (
    <Link href="/landing" className={cn("title-h2 outline-ring", className)}>
      <Logo
        variant={variant}
        className={cn({ "w-[13rem] sm:w-[10.25rem]": variant === "full" })}
      />
    </Link>
  );
}
