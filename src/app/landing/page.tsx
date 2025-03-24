import { Header } from "./_sections/Header";
import { HeroSection } from "./_sections/HeroSection";
import { AboutSection } from "./_sections/AboutSection";
import { FeaturesSection } from "./_sections/FeaturesSection";
import featuresBackground from "./_assets/features-bg.svg?url";
import { GuideSection } from "./_sections/GuideSection";
import { ContactsSection } from "./_sections/ContactsSection";
import { AcknowledgmentsSection } from "./_sections/AcknowledgmentsSection";
import { Footer } from "./_sections/Footer";
import Image from "next/image";

const NAVIGATION_ANCHORS = {
  about: { id: "about", name: "About" },
  features: { id: "features", name: "Features" },
  guide: { id: "guide", name: "Guide" },
  contacts: { id: "contacts", name: "Contacts" },
};

export default function LandingPage() {
  return (
    <div className="bg-black-120 text-[1rem] leading-[1.4] text-grey-40">
      <Header navigationAnchors={Object.values(NAVIGATION_ANCHORS)} />
      <main className="space-y-44 sm:space-y-24">
        <HeroSection />
        <AboutSection
          className="relative z-10"
          id={NAVIGATION_ANCHORS.about.id}
        />
        <div className="relative overflow-x-clip">
          <Image
            src={featuresBackground}
            alt=""
            loading="lazy"
            className="absolute bottom-[calc(100%-20rem)] left-1/2 w-screen max-w-max -translate-x-1/2 md:w-[200%] sm:hidden"
          />
          <FeaturesSection
            className="relative"
            id={NAVIGATION_ANCHORS.features.id}
          />
        </div>
        <GuideSection id={NAVIGATION_ANCHORS.guide.id} />
        <ContactsSection id={NAVIGATION_ANCHORS.contacts.id} />
        <AcknowledgmentsSection />
      </main>
      <Footer
        className="mt-40 sm:mt-24"
        navigationAnchors={Object.values(NAVIGATION_ANCHORS)}
      />
    </div>
  );
}
