import "@/styles/globals.css";
import { type Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "vscubing",
  description:
    "A contest platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
