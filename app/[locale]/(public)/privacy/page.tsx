import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PolicyPageShell from '../_components/policy-page-shell'
import PolicySection from '../_components/policy-section'
import { PRIVACY_CONTENT } from './_content'
import { buildPrivacyJsonLd, generatePrivacyMetadata } from './_seo'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generatePrivacyMetadata(locale)
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations()
  const sections = PRIVACY_CONTENT[locale]

  return (
    <>
      <JsonLd data={buildPrivacyJsonLd(locale)} />

      <PolicyPageShell
        eyebrow={t('policies.common.eyebrow')}
        title={t('policies.privacy.title')}
        subtitle={t('policies.privacy.subtitle')}
        homeLabel={t('policies.common.home')}
        breadcrumb={[{ label: t('policies.privacy.breadcrumb') }]}
        contact={{
          title: t('policies.common.contact.title'),
          description: t('policies.common.contact.description'),
          hotlineLabel: t('policies.common.contact.hotlineLabel'),
          emailLabel: t('policies.common.contact.emailLabel')
        }}
      >
        {sections.map((section) => (
          <PolicySection key={section.title} section={section} />
        ))}
      </PolicyPageShell>
    </>
  )
}
