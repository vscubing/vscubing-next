import { Header } from "./sections/Header";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import featuresBackground from "./assets/features-bg.svg?url";
import { GuideSection } from "./sections/GuideSection";
import { ContactsSection } from "./sections/ContactsSection";
import { AcknowledgmentsSection } from "./sections/AcknowledgmentsSection";
import { Footer } from "./sections/Footer";

const NAVIGATION_ANCHORS = {
  about: { id: "about", name: "About" },
  features: { id: "features", name: "Features" },
  guide: { id: "guide", name: "Guide" },
  contacts: { id: "contacts", name: "Contacts" },
};

export function LandingPage() {
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
          <img
            src={featuresBackground}
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
