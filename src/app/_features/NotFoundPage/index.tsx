import { PrimaryButton } from "@/app/_components/ui";
import { Suspense, type ReactNode } from "react";
// import { matchesQuery } from "@/app/_utils/tailwind";
import { Header, Layout } from "@/app/_components/layout";
import Link from "next/link";
import ParallaxCubesWrapper from "./ParallaxCubes";

export function NotFoundPage() {
  return (
    <Suspense fallback={<PageContent />}>
      <ParallaxCubesWrapper>
        {(renderParallaxCubes) => (
          <PageContent renderParallaxCubes={renderParallaxCubes} />
        )}
      </ParallaxCubesWrapper>
    </Suspense>
  );
}

type NotFoundInnerProps = { renderParallaxCubes?: () => ReactNode };
function PageContent({ renderParallaxCubes }: NotFoundInnerProps) {
  return (
    <Layout>
      <div className="flex flex-1 flex-col gap-3 sm:gap-0">
        <Header className="hidden lg:flex" />
        <div className="relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8">
          {renderParallaxCubes?.()}
          <div className="relative max-w-[35rem] sm:max-w-none">
            <p className="title-lg mb-4">Lost in cuberspace?</p>
            <p className="text-large mb-8 inline-block">
              Sorry, the page you&apos;re looking for seems to have gone on a
              digital adventure of its own
            </p>
            <Link href="/">
              <PrimaryButton
                className="sm:w-full"
                // TODO: fix next
                // size={matchesQuery("sm") ? "sm" : "lg"}
                size={"sm"}
              >
                Go back to dashboard
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
