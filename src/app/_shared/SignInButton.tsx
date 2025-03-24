import { cn } from "@/app/_utils/cn";
import { GhostButton, GoogleIcon, PrimaryButton } from "@/app/_components/ui";
import { signIn } from "@/server/auth";
import type { ReactNode } from "react";

type SignInButtonProps = { variant: "primary" | "ghost"; className?: string };
export function SignInButton({ variant, className }: SignInButtonProps) {
  if (variant === "primary") {
    return (
      <SignInForm>
        <PrimaryButton
          className={cn("h-12 gap-3 px-4 text-[1.125rem] sm:h-12", className)}
        >
          <GoogleIcon />
          Sign in with Google
        </PrimaryButton>
      </SignInForm>
    );
  }

  return (
    <SignInForm>
      <GhostButton
        className={cn(
          "h-12 gap-3 px-4 text-[1.125rem] hover:border hover:border-white-100 hover:bg-transparent active:bg-white-100 active:text-black-100 sm:h-10 sm:border sm:border-white-100 sm:px-3",
          className,
        )}
      >
        <span className="contents sm:hidden">
          <GoogleIcon />
          <span>Sign in with Google</span>
        </span>
        <span className="hidden text-[0.875rem] sm:contents">Sign in</span>
      </GhostButton>
    </SignInForm>
  );
}

function SignInForm({ children }: { children: ReactNode }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      {children}
    </form>
  );
}
