import { SecondaryButton, ShareIcon } from "@/app/_components/ui";
import smileyArrowImg from "../../assets/features-sharing-img.svg?url";
import cursorIcon from "../../assets/features-sharing-cursor.svg?url";
import { AnimationItem } from "./animations";

export function SharingAnimation() {
  return (
    <div className="flex h-full items-center justify-center gap-3">
      <div className="relative">
        <SecondaryButton
          asChild
          size="iconSm"
          className="animate-landing-features-sharing-button cursor-pointer sm:h-15 sm:w-15"
        >
          <AnimationItem shouldRegisterAnimationEnd={false} block="sharing">
            <ShareIcon />
          </AnimationItem>
        </SecondaryButton>
        <AnimationItem
          block="sharing"
          shouldRegisterAnimationEnd={false}
          className="absolute left-[70%] top-[80%] animate-landing-features-sharing-cursor"
        >
          <img src={cursorIcon} alt="" />
        </AnimationItem>
      </div>
      <AnimationItem
        block="sharing"
        className="animate-landing-features-sharing-img [clip-path:inset(0_100%_0_0)]"
      >
        <img src={smileyArrowImg} alt="" />
      </AnimationItem>
    </div>
  );
}
