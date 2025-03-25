import { Container } from "../shared/Container";
import cstimerLogo from "../assets/cstimer-logo.png";
import cubingjsLogo from "../assets/cubingjs-logo.png";
import sportcubingLogo from "../assets/sportcubing-logo.png";
import Image from "next/image";

export function AcknowledgmentsSection() {
  return (
    <Container>
      <section>
        <h2 className="landing-h2 mb-4 text-center">Acknowledgments</h2>
        <p className="mb-14 text-center sm:mb-10">
          Special thanks to the incredible tools and platforms that power our
          project
        </p>
        <div className="grid grid-cols-3 gap-3 md:mx-auto md:max-w-[40rem] md:grid-cols-1">
          <Acknowledgment
            name="csTimer"
            link="https://csTimer.net"
            logoImg={cstimerLogo.src}
            description="The heartbeat of our solving simulator"
          />
          <Acknowledgment
            name="cubing.js"
            link="https://js.cubing.net/cubing"
            logoImg={cubingjsLogo.src}
            description="Bringing our puzzle replays to life"
          />
          <Acknowledgment
            name="sportcubing.in.ua"
            link="https://sportcubing.in.ua"
            logoImg={sportcubingLogo.src}
            description="Our guiding light in the cubing world"
          />
        </div>
      </section>
    </Container>
  );
}

function Acknowledgment({
  name,
  link,
  logoImg,
  description,
}: {
  name: string;
  link: string;
  logoImg: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-black-100 p-10 sm:p-6">
      <a href={link} className="group mb-4 inline-flex items-end gap-2">
        <span className="flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-2xl bg-white-100">
          <Image src={logoImg} alt={name} />
        </span>
        <span className="text-primary-60 group-hover:underline">{name}</span>
      </a>
      <p>{description}</p>
    </div>
  );
}
