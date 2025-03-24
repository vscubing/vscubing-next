"use client";

import { PlayIcon } from "@/app/_components/ui";
import { cn } from "@/app/_utils/cn";
import { type ComponentPropsWithoutRef, useRef, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

export function LazyAutoplayVideo({
  thumbnail,
  webm,
  mp4,
  replayable = false,
  className,
  ...props
}: {
  thumbnail: string;
  webm: string;
  mp4: string;
  replayable?: boolean;
} & ComponentPropsWithoutRef<"video">) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const { ref: intersectionRef } = useIntersectionObserver({
    threshold: 1,
    freezeOnceVisible: true,
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        void ref.current?.play();
      }
    },
  });

  const [hasEnded, setHasEnded] = useState(false);
  function restart() {
    void ref.current!.play();
    setHasEnded(false);
  }

  const replayControlsVisible = replayable && hasEnded;

  return (
    <div className="relative">
      {replayControlsVisible && (
        <button
          onClick={restart}
          className="outline-ring transition-base absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary-60 text-black-100 hover:bg-primary-80 active:bg-primary-60"
        >
          <PlayIcon />
        </button>
      )}
      <video
        preload="none"
        poster={thumbnail}
        playsInline
        muted
        {...props}
        ref={(el) => {
          ref.current = el;
          intersectionRef(el);
        }}
        onEnded={() => setHasEnded(true)}
        className={cn({ "brightness-75": replayControlsVisible }, className)}
      >
        <source src={webm} type="video/webm; codecs=vp9" />
        <source src={mp4} type="video/mp4" />
      </video>
    </div>
  );
}
