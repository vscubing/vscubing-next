"use client";

import {
  useTwistyPlayer,
  TwistyCube,
  TwistyControls,
  TwistyScrubber,
} from "@/app/_shared/twisty";
import { useEffect } from "react";

export default function TwistySection() {
  const player = useTwistyPlayer(VALK_474_WR);

  useEffect(() => player?.play(), [player]);

  if (!player) {
    return null;
  }

  return (
    <>
      <TwistyCube player={player} className="mb-2 h-full w-full flex-1" />
      <TwistyScrubber player={player} className="mb-1 w-full px-12" />
      <TwistyControls player={player} className="w-full px-8" size="sm" />
    </>
  );
}

const VALK_474_WR = {
  scramble: "F2 U2 R2 F' L2 F2 U' R F D U F2 U R B R2 U B' R'",
  solution:
    "z r' D R2 R U' R' U' L' U' L U' U' R U R' d' U' R U R' d' U' R U' R' L U' L' y' U' U' R' U2 R U' U' R' U R' F R F' U R U",
  discipline: "3by3",
};
