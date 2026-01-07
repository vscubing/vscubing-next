import { ExtrasHeader } from '../_shared/header'
import { HeroSection } from './_sections/hero-section'
import { AboutSection } from './_sections/about-section'
import { FeaturesSection } from './_sections/features-section'
import featuresBackground from '../../../../public/landing/features-bg.svg'
import { GuideSection } from './_sections/guide-section'
import { ContactsSection } from './_sections/contacts-section'
import { AcknowledgmentsSection } from './_sections/acknowledgments-section'
import { Footer } from '../_shared/footer'
import Image from 'next/image'

export const dynamic = 'force-static'

const NAVIGATION_ANCHORS = {
  about: { id: 'about', name: 'About' },
  features: { id: 'features', name: 'Features' },
  guide: { id: 'guide', name: 'Guide' },
  contacts: { id: 'contacts', name: 'Contacts' },
}

const HEADER_LINKS = Object.values(NAVIGATION_ANCHORS).map(({ id, name }) => ({
  href: `#${id}`,
  name,
}))

export default function LandingPage() {
  return (
    <div className='bg-black-120 text-[1rem] leading-[1.4] text-grey-40'>
      <ExtrasHeader navigationLinks={HEADER_LINKS} />
      <main className='space-y-44 sm:space-y-24'>
        <HeroSection />
        <AboutSection
          className='relative z-10'
          id={NAVIGATION_ANCHORS.about.id}
        />
        <div className='relative overflow-x-clip'>
          <Image
            src={featuresBackground}
            alt=''
            loading='lazy'
            className='absolute bottom-[calc(100%-20rem)] left-1/2 w-screen max-w-max -translate-x-1/2 md:w-[200%] sm:hidden'
          />
          <FeaturesSection
            className='relative'
            id={NAVIGATION_ANCHORS.features.id}
          />
        </div>
        <GuideSection id={NAVIGATION_ANCHORS.guide.id} />
        <ContactsSection id={NAVIGATION_ANCHORS.contacts.id} />
        <AcknowledgmentsSection />
      </main>
      <Footer className='mt-40 sm:mt-24' />
    </div>
  )
}
