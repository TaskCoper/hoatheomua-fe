import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PolicyPageShell from '../_components/policy-page-shell'
import PolicySection from '../_components/policy-section'
import { RETURNS_CONTENT } from './_content'
import { buildReturnsJsonLd, generateReturnsMetadata } from './_seo'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateReturnsMetadata(locale)
}

export default async function ReturnsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations()
  const sections = RETURNS_CONTENT[locale]

  return (
    <>
      <JsonLd data={buildReturnsJsonLd(locale)} />

      <PolicyPageShell
        eyebrow={t('policies.common.eyebrow')}
        title={t('policies.returns.title')}
        subtitle={t('policies.returns.subtitle')}
        homeLabel={t('policies.common.home')}
        breadcrumb={[{ label: t('policies.returns.breadcrumb') }]}
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
