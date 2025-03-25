import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth, signOut, signIn } from "@/server/auth";
import { api } from "@/trpc/server";
import { Header } from "../_components/layout";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <>
      <Header />
      <main className="text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 md:gap-8 sm:grid-cols-2">
            <Link
              className="bg-white/10 hover:bg-white/20 flex max-w-xs flex-col gap-4 rounded-xl p-4"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="bg-white/10 hover:bg-white/20 flex max-w-xs flex-col gap-4 rounded-xl p-4"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-white text-2xl">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-white text-center text-2xl">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              {session && (
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button className="bg-white/10 hover:bg-white/20 cursor-pointer rounded-full px-10 py-3 font-semibold no-underline transition">
                    Sign out
                  </button>
                </form>
              )}
              {!session && (
                <form
                  action={async () => {
                    "use server";
                    await signIn("google");
                  }}
                >
                  <button className="bg-white/10 hover:bg-white/20 cursor-pointer rounded-full px-10 py-3 font-semibold no-underline transition">
                    Sign in
                  </button>
                </form>
              )}
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </main>
    </>
  );
}
