"use client";

import { DiscordIcon, PrimaryButton } from "@/app/_components/ui";
import { Container } from "../_shared/Container";
import contactsPeopleImg from "../_assets/contacts-people.svg?url";
import { AnimatedBlob } from "../_shared/AnimatedBlob";
import Image from "next/image";
import { useMatchesScreen } from "@/app/_utils/tailwind";

export function ContactsSection({ id }: { id: string }) {
  const isSmScreen = useMatchesScreen("sm");

  return (
    <Container>
      <section id={id} className="landing-offset-anchor">
        <div className="grid grid-cols-2 grid-rows-[30rem] gap-3 md:grid-cols-1 md:grid-rows-[30rem,30rem] sm:grid-rows-none">
          <div className="relative sm:rounded-3xl sm:px-4 sm:pb-4 sm:pt-15 sm:[background:linear-gradient(119deg,_rgba(54,60,64,1)_16%,rgba(27,30,37,1)_80%)]">
            <div
              className="flex h-full flex-col justify-center px-10 pb-28 pt-14 [background:linear-gradient(119deg,_rgba(54,60,64,1)_16%,rgba(27,30,37,1)_80%)] sm:h-auto sm:bg-none sm:p-0"
              style={{
                clipPath: isSmScreen ? "none" : CLIP_PATH_POLYGON,
              }}
            >
              <h2 className="landing-h2 mb-6">
                Join <span className="landing-h3 text-grey-40">our</span>{" "}
                growing community{" "}
                <span className="landing-h3 text-grey-40">of</span>&nbsp;virtual
                speedcubers!
              </h2>
              <p>
                Share your solves, discuss strategies, and connect with fellow
                enthusiasts
              </p>
            </div>
            <PrimaryButton
              asChild
              className="sm:h-22 group absolute bottom-0 right-0 h-[5.95rem] w-[21.2rem] rounded-3xl sm:static sm:mt-14 sm:w-full sm:rounded-xl"
            >
              <a href="https://discord.gg/PxFrW9vTAy" target="_blank">
                Join us on Discord{" "}
                <DiscordIcon className="transition-base ml-4 origin-top-right text-4xl group-hover:rotate-[-20deg]" />
              </a>
            </PrimaryButton>
          </div>
          <div className="relative flex items-center justify-center overflow-clip rounded-3xl bg-secondary-80 md:row-start-1 sm:py-12">
            <AnimatedBackground />
            <Image
              src={contactsPeopleImg}
              loading="lazy"
              alt="people with cubes"
              className="relative max-w-[80%]"
            />
          </div>
        </div>
      </section>
    </Container>
  );
}

function AnimatedBackground() {
  return (
    <>
      <AnimatedBlob
        fromLeft="-15%"
        fromTop="-5%"
        toLeft="-18%"
        toTop="50%"
        className="h-[58%] bg-secondary-40"
      />
      <AnimatedBlob
        fromLeft="30%"
        fromTop="-30%"
        toLeft="80%"
        toTop="-20%"
        className="h-[58%] bg-secondary-20"
      />
      <AnimatedBlob
        fromLeft="80%"
        fromTop="65%"
        toLeft="40%"
        toTop="65%"
        className="h-[58%] bg-primary-80"
      />
      <AnimatedBlob
        fromLeft="-12%"
        fromTop="62%"
        toLeft="-12%"
        toTop="-27%"
        className="h-[58%] bg-primary-60"
      />
      <AnimatedBlob
        fromLeft="75%"
        fromTop="-8%"
        toLeft="85%"
        toTop="35%"
        className="h-[58%] bg-primary-80"
      />
      <AnimatedBlob
        fromLeft="38%"
        fromTop="65%"
        toLeft="20%"
        toTop="20%"
        className="h-[58%] bg-secondary-40"
      />
      <AnimatedBlob
        fromLeft="28%"
        fromTop="8%"
        toLeft="40%"
        toTop="-45%"
        className="h-[58%] bg-primary-100"
      />
    </>
  );
}

const CLIP_PATH_POLYGON = `polygon(calc(100% - 0px) 24px, calc(100% - 0px) 24px, calc(100% - 0.3141149999999px) 20.1070836px, calc(100% - 1.2235199999999px) 16.4141568px, calc(100% - 2.678805px) 12.9706332px, calc(100% - 4.6305599999999px) 9.8259264px, calc(100% - 7.0293750000001px) 7.02945px, calc(100% - 9.82584px) 4.6306176px, calc(100% - 12.970545px) 2.6788428px, calc(100% - 16.41408px) 1.2235392px, calc(100% - 20.107035px) 0.3141204px, calc(100% - 24px) 3.9733444681785E-31px, 24px 0px, 24px 0px, 20.1070836px 0.3141204px, 16.4141568px 1.2235392px, 12.9706332px 2.6788428px, 9.8259264px 4.6306176px, 7.02945px 7.02945px, 4.6306176px 9.8259264px, 2.6788428px 12.9706332px, 1.2235392px 16.4141568px, 0.3141204px 20.1070836px, 3.9733444681785E-31px 24px, 0px calc(100% - 24px), 0px calc(100% - 24px), 0.3141204px calc(100% - 20.107035px), 1.2235392px calc(100% - 16.41408px), 2.6788428px calc(100% - 12.970545px), 4.6306176px calc(100% - 9.82584px), 7.02945px calc(100% - 7.029375px), 9.8259264px calc(100% - 4.63056px), 12.9706332px calc(100% - 2.678805px), 16.4141568px calc(100% - 1.22352px), 20.1070836px calc(100% - 0.31411500000002px), 24px calc(100% - 0px), calc(100% - 374px) calc(100% - 0px), calc(100% - 374px) calc(100% - 0px), calc(100% - 370.107035px) calc(100% - 0.31411499999996px), calc(100% - 366.41408px) calc(100% - 1.2235199999999px), calc(100% - 362.970545px) calc(100% - 2.678805px), calc(100% - 359.82584px) calc(100% - 4.63056px), calc(100% - 357.029375px) calc(100% - 7.029375px), calc(100% - 354.63056px) calc(100% - 9.82584px), calc(100% - 352.678805px) calc(100% - 12.970545px), calc(100% - 351.22352px) calc(100% - 16.41408px), calc(100% - 350.314115px) calc(100% - 20.107035px), calc(100% - 350px) calc(100% - 24px), calc(100% - 350px) calc(100% - 84px), calc(100% - 350px) calc(100% - 84px), calc(100% - 349.685885px) calc(100% - 87.892965px), calc(100% - 348.77648px) calc(100% - 91.58592px), calc(100% - 347.321195px) calc(100% - 95.029455px), calc(100% - 345.36944px) calc(100% - 98.17416px), calc(100% - 342.970625px) calc(100% - 100.970625px), calc(100% - 340.17416px) calc(100% - 103.36944px), calc(100% - 337.029455px) calc(100% - 105.321195px), calc(100% - 333.58592px) calc(100% - 106.77648px), calc(100% - 329.892965px) calc(100% - 107.685885px), calc(100% - 326px) calc(100% - 108px), calc(100% - 24px) calc(100% - 108px), calc(100% - 24px) calc(100% - 108px), calc(100% - 20.107035px) calc(100% - 108.314115px), calc(100% - 16.41408px) calc(100% - 109.22352px), calc(100% - 12.970545px) calc(100% - 110.678805px), calc(100% - 9.82584px) calc(100% - 112.63056px), calc(100% - 7.0293750000001px) calc(100% - 115.029375px), calc(100% - 4.6305600000001px) calc(100% - 117.82584px), calc(100% - 2.6788050000001px) calc(100% - 120.970545px), calc(100% - 1.22352px) calc(100% - 124.41408px), calc(100% - 0.31411500000002px) calc(100% - 128.107035px), calc(100% - 1.1368683772162E-13px) calc(100% - 132px), calc(100% - 0px) 24px)`;
