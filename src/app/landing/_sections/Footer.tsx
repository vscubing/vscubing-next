import {
    ChevronLeftIcon,
    DiscordIcon,
    GithubIcon,
    LinkedinIcon,
    Logo,
    SecondaryButton,
} from "@/app/_components/ui";
import { Container } from "../_shared/Container";
import { cn } from "@/app/_utils/cn";
import footerBgCubes from "../_assets/footer/footer-bg-cubes.svg?url";
import animatedCube1 from "../_assets//footer/animated-cube-1.svg?url";
import animatedCube2 from "../_assets//footer/animated-cube-2.svg?url";
import animatedCube3 from "../_assets//footer/animated-cube-3.svg?url";
import animatedCube4 from "../_assets//footer/animated-cube-4.svg?url";
import animatedCube5 from "../_assets//footer/animated-cube-5.svg?url";
import animatedCube6 from "../_assets//footer/animated-cube-6.svg?url";
import animatedCube7 from "../_assets//footer/animated-cube-7.svg?url";
import animatedCube8 from "../_assets//footer/animated-cube-8.svg?url";
import animatedCube9 from "../_assets//footer/animated-cube-9.svg?url";
import standWithUkraineImg from "@/app/_assets/images/stand-with-ukraine.svg?url";
import { type CSSProperties } from "react";

export function Footer({
  className,
  navigationAnchors,
}: {
  className: string;
  navigationAnchors: { id: string; name: string }[];
}) {
  return (
    <Container className={cn("pb-[1.625rem]", className)}>
      <footer className="relative overflow-clip rounded-3xl px-[1.625rem] pb-[1.625rem] pt-10 [background:linear-gradient(180deg,#060709_0%,#494C74_100%)] sm:px-6">
        <AnimatedBackground />

        <div
          className="relative" /* position:relative to put it over footerBgCubes */
        >
          <div className="mb-7 flex items-center justify-between">
            <Logo variant="full" className="w-[38.5rem] sm:w-auto" />
            <SecondaryButton
              asChild
              className="h-11 w-11 px-0 sm:h-11 sm:w-11 [&>svg]:h-6 [&>svg]:w-6"
            >
              <a href="#">
                <ChevronLeftIcon className="rotate-90" />
              </a>
            </SecondaryButton>
          </div>
          <div className="flex gap-3 pl-2 lg:flex-col lg:gap-10 lg:pl-0">
            <div className="w-[19.125rem]">
              <div className="mb-2">
                <h2 className="landing-h3 mb-4">Have questions?</h2>
                <p>Reach out to us at</p>
              </div>
              <div className="-ml-2 flex gap-2">
                {[
                  {
                    href: "https://github.com/vscubing",
                    children: <GithubIcon />,
                  },
                  {
                    href: "https://www.linkedin.com/company/vscubing",
                    children: <LinkedinIcon />,
                  },
                  {
                    href: "https://discord.gg/PxFrW9vTAy",
                    children: <DiscordIcon />,
                  },
                ].map(({ href, children }) => (
                  <a
                    href={href}
                    key={href}
                    className="transition-base outline-ring flex h-11 w-11 items-center justify-center text-[1.5rem] text-grey-20 hover:text-primary-80"
                    target="_blank"
                  >
                    {children}
                  </a>
                ))}
              </div>
            </div>
            <div className="w-[21.125rem] pt-3">
              <h2 className="mb-4 font-medium text-white-100">Quick links</h2>
              <nav className="flex flex-col gap-[.8rem]">
                {navigationAnchors
                  .filter(({ id }) => id !== "contacts") // we already have the contacts in the footer
                  .map(({ id, name }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="text-[1.125rem] font-medium hover:text-white-100"
                    >
                      {name}
                    </a>
                  ))}
              </nav>
            </div>
            <div className="flex-1 pt-3">
              <h2 className="mb-4 font-medium text-white-100">Creators</h2>
              <ul className="flex flex-col gap-[.8rem] text-[1.125rem] font-medium">
                <li>
                  <a
                    className="hover:text-white-100"
                    href="https://www.linkedin.com/in/bohdan-chornokondratenko-98075b202/"
                  >
                    Bohdan Chornokondratenko - Frontend Developer
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white-100"
                    href="https://www.linkedin.com/in/anton-savytskyi/"
                  >
                    Anton Savytskyi - Backend Developer
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white-100"
                    href="https://www.linkedin.com/in/olesiapetryk/"
                  >
                    Olesia Petryk - UX/UI Designer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-5 flex justify-end sm:mt-20 sm:justify-start">
            <a href="https://u24.gov.ua/about">
              <img src={standWithUkraineImg} alt="Stand with Ukraine" />
            </a>
          </div>
        </div>
      </footer>
    </Container>
  );
}

function AnimatedBackground() {
  return (
    <div className="sm:hidden">
      <img
        src={footerBgCubes}
        alt=""
        className="pointer-events-none absolute bottom-0 right-[-3rem] max-w-max lg:right-[-4rem] md:bottom-[-1rem]"
      />
      <AnimatedCube
        src={animatedCube1}
        className="bottom-[-7.5rem] left-[-3.8rem] md:hidden"
        toTranslateY="-10%"
      />
      <AnimatedCube
        src={animatedCube2}
        className="bottom-0 left-[26%] md:hidden"
        toTranslateY="35%"
      />
      <AnimatedCube
        src={animatedCube3}
        className="bottom-[-10.5rem] left-[40%] lg:left-[30%] md:bottom-[-12rem] md:left-[-6rem]"
        toTranslateY="-10%"
      />
      <AnimatedCube
        src={animatedCube4}
        className="bottom-[-16.5rem] left-[56%] md:left-[6rem]"
        toTranslateY="-7%"
      />
      <AnimatedCube
        src={animatedCube5}
        className="bottom-[1rem] left-[65%] lg:left-[50%] md:left-[35%]"
        toTranslateY="35%"
      />
      <AnimatedCube
        src={animatedCube6}
        className="bottom-[3.5rem] right-[12rem]"
        toTranslateY="35%"
      />
      <AnimatedCube
        src={animatedCube7}
        className="bottom-[-1rem] right-[1rem] md:right-[-1rem]"
        toTranslateY="-30%"
      />
      <AnimatedCube
        src={animatedCube8}
        className="right-[10rem] top-[2.5rem] lg:bottom-[13rem] lg:right-[25rem] lg:top-auto md:right-[6rem]"
        toTranslateY="10%"
      />
      <AnimatedCube
        src={animatedCube9}
        className="right-[.2rem] top-[0] lg:bottom-[14rem] lg:right-[15rem] lg:top-auto md:right-[-3rem]"
        toTranslateY="15%"
      />
    </div>
  );
}

function AnimatedCube({
  src,
  className,
  toTranslateY,
}: {
  src: string;
  className: string;
  toTranslateY: string;
}) {
  return (
    <img
      src={src}
      alt=""
      className={cn(
        "pointer-events-none absolute animate-landing-footer-cubes",
        className,
      )}
      style={{ "--toTranslateY": toTranslateY } as CSSProperties}
    />
  );
}
