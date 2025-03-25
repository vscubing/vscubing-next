import { TRPCReactProvider } from "@/trpc/react";
import { Layout } from "../_components/layout";
import type { ReactNode } from "react";
import { HydrateClient } from "@/trpc/server";

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <TRPCReactProvider>
      <HydrateClient>
        <Layout>{children}</Layout>
      </HydrateClient>
    </TRPCReactProvider>
  );
}
