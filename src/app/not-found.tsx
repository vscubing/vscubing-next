import { Layout, Header } from "./_components/layout";
import {
  LinkToDashboard,
  ParallaxCubes,
  ParallaxCubesWrapper,
} from "./_not-found-client";

export default function NotFound() {
  return (
    <ParallaxCubesWrapper>
      <Layout>
        <div className="flex flex-1 flex-col gap-3 sm:gap-0">
          <Header className="hidden lg:flex" />
          <div className="relative flex-1 rounded-xl bg-black-80 p-16 sm:p-8">
            <ParallaxCubes />
            <div className="relative max-w-[35rem] sm:max-w-none">
              <p className="title-lg mb-4">Lost in cuberspace?</p>
              <p className="text-large mb-8 inline-block">
                Sorry, the page you&apos;re looking for seems to have gone on a
                digital adventure of its own
              </p>
              <LinkToDashboard />
            </div>
          </div>
        </div>
      </Layout>
    </ParallaxCubesWrapper>
  );
}
