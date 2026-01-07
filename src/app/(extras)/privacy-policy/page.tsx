import { ExtrasHeader } from '../_shared/header'
import { Footer } from '../_shared/footer'
import { Container } from '../_shared/container'
import type { ReactNode } from 'react'

export const dynamic = 'force-static'

export default function PrivacyPolicyPage() {
  return (
    <div className='bg-black-120 text-[1rem] leading-[1.4] text-grey-40'>
      <ExtrasHeader
        navigationLinks={[
          { name: 'Landing', href: '/landing' },
          { name: 'Dashboard', href: '/' },
        ]}
      />
      <Container>
        <main className='pt-28 md:min-h-0 md:pt-24'>
          <section className='mb-10 rounded-3xl px-4 py-10 [background:linear-gradient(159deg,rgba(73,76,116,1)_0%,rgba(27,30,37,1)_71%)]'>
            <div className='mx-auto max-w-[40rem] text-center'>
              <h1 className='landing-h1 mb-10 sm:mb-5'>Privacy Policy</h1>
              <p className='mb-10 sm:mb-5'>
                This Privacy Policy explains how vscubing (“we”, “us”, “our”)
                processes personal data when you use our website and services.
                We are committed to protecting your privacy and processing
                personal data in accordance with the General Data Protection
                Regulation (GDPR).
              </p>
              <p className='text-grey-60'>Last Updated: TBD</p>{' '}
              {/* TODO: FILL THIS OUT!!! */}
            </div>
          </section>
          <div>
            <div className='space-y-2 text-sm text-grey-40 [&>*:nth-child(even)]:[background:linear-gradient(116deg,rgba(54,60,64,1)_16%,rgba(27,30,37,1)_80%)] [&>*:nth-child(odd)]:bg-black-100'>
              <Section>
                <h2 className='landing-h2 mb-6'>1. Who we are</h2>
                <p className='mb-2'>
                  vscubing is an online platform for competing in virtual
                  Rubik’s Cube–like puzzle simulators.
                </p>
                <p>
                  <strong>
                    Contact (including data protection and deletion requests):
                  </strong>
                  <br />
                  contact.vscubing@gmail.com
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>2. What data we collect</h2>

                <h3 className='landing-h3 mb-3'>
                  2.1 Account and authentication data
                </h3>
                <p className='mb-2'>
                  When you create an account or sign in, we process the
                  following personal data:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>Email address</li>
                  <li>
                    OAuth provider identifier (e.g. Google provider account ID)
                  </li>
                  <li>Authentication session data (via an in-house cookie)</li>
                </ul>
                <p className='mb-2'>
                  This data is necessary to create and manage user accounts and
                  to provide authentication.
                </p>

                <h3 className='landing-h3 mb-3'>
                  2.2 World Cube Association (WCA) integration
                </h3>
                <p className='mb-2'>
                  Users may optionally link a World Cube Association (WCA)
                  account to their vscubing profile. If you do so, we process:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>Your WCA ID</li>
                  <li>Email address linked to the WCA accound</li>
                </ul>
                <p className='mb-2'>
                  We may display publicly available WCA information (such as
                  first name, last name, and profile picture) on your profile.
                  This information is retrieved from the WCA and displayed on
                  the website but is not permanently stored by us.
                </p>

                <h3 className='landing-h3 mb-3'>2.3 Analytics data</h3>
                <p className='mb-2'>
                  We use PostHog to understand how the platform is used and to
                  improve stability, performance, and user experience. The
                  following data may be processed:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>IP address</li>
                  <li>Device and browser information</li>
                  <li>Usage events (such as page views and interactions)</li>
                </ul>
                <p className='mb-2'>
                  We do not use session replay, do not send email addresses to
                  PostHog, and do not use feature flags. We only use PostHog's
                  EU-based servers.
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>
                  3. Legal basis for processing
                </h2>
                <p className='mb-2'>
                  We process personal data on the following legal bases under
                  Article 6 GDPR:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>
                    <strong>Contract necessity (Art. 6(1)(b))</strong> — For
                    account creation, authentication, and core platform
                    functionality.
                  </li>
                  <li>
                    <strong>Legitimate interest (Art. 6(1)(f))</strong> — For
                    analytics, where processing is necessary to improve the
                    platform and ensure its reliability, while respecting user
                    privacy and minimizing collected data.
                  </li>
                </ul>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>
                  4. Cookies and similar technologies
                </h2>
                <p className='mb-2'>
                  We use an in-house authentication cookie to maintain user
                  sessions. This cookie is required for the operation of the
                  website.
                </p>
                <p>We do not use advertising cookies.</p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>5. Third-party services</h2>
                <p className='mb-2'>
                  We use the following third-party services to operate the
                  platform:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>Google OAuth – for user authentication</li>
                  <li>
                    World Cube Association OAuth – optional account linking
                  </li>
                  <li>PostHog – analytics (EU-hosted)</li>
                </ul>
                <p>
                  These services process personal data only as necessary to
                  provide their functionality.
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>6. Data retention</h2>
                <p className='mb-2'>
                  Account data is stored for as long as your account exists.
                </p>
                <p className='mb-2'>
                  Analytics data is retained for a limited period and deleted in
                  accordance with our PostHog retention settings.
                </p>
                <p>
                  You may request deletion of your account and associated data
                  at any time.
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>7. Your rights</h2>
                <p className='mb-2'>
                  Under the GDPR, you have the following rights:
                </p>
                <ul className='mb-2 list-inside list-disc'>
                  <li>Right of access to your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure (“right to be forgotten”)</li>
                  <li>Right to restriction of processing</li>
                  <li>
                    Right to object to processing based on legitimate interest
                  </li>
                  <li>Right to data portability</li>
                </ul>
                <p>
                  To exercise your rights, contact us at:
                  contact.vscubing@gmail.com
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>8. Data security</h2>
                <p>
                  We take appropriate technical and organizational measures to
                  protect personal data against unauthorized access, loss, or
                  misuse.
                </p>
              </Section>

              <Section>
                <h2 className='landing-h2 mb-6'>
                  9. Changes to this Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. The
                  current version will always be available on the website.
                </p>
              </Section>
            </div>
          </div>
        </main>
      </Container>
      <Footer className='mt-40 sm:mt-24' />
    </div>
  )
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section className='mx-auto max-w-[40rem] rounded-3xl p-10 sm:p-6'>
      {children}
    </section>
  )
}
