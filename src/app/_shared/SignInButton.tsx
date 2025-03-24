"use client";

import { cn } from "@/app/_utils/cn";
import { GhostButton, GoogleIcon, PrimaryButton } from "@/app/_components/ui";
import { signIn } from "next-auth/react";
import { useTransition } from "react";

type SignInButtonProps = { variant: "primary" | "ghost"; className?: string };
export function SignInButton({ variant, className }: SignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleSignInTransition() {
    startTransition(async () => {
      await signIn("google");
    });
  }

  if (variant === "primary") {
    return (
      <PrimaryButton
        className={cn("h-12 gap-3 px-4 text-[1.125rem] sm:h-12", className)}
        disabled={isPending}
        onClick={handleSignInTransition}
      >
        <GoogleIcon />
        Sign in with Google
      </PrimaryButton>
    );
  }

  return (
    <GhostButton
      className={cn(
        "h-12 gap-3 px-4 text-[1.125rem] hover:border hover:border-white-100 hover:bg-transparent active:bg-white-100 active:text-black-100 sm:h-10 sm:border sm:border-white-100 sm:px-3",
        className,
      )}
      disabled={isPending}
      onClick={handleSignInTransition}
    >
      <span className="contents sm:hidden">
        <GoogleIcon />
        <span>Sign in with Google</span>
      </span>
      <span className="hidden text-[0.875rem] sm:contents">Sign in</span>
    </GhostButton>
  );
}
