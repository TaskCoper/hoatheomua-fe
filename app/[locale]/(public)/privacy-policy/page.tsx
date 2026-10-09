import LegalDocument, { LegalList, LegalSection } from '@/features/legal/components/legal-document'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type PrivacyTranslations = Awaited<ReturnType<typeof getTranslations>>

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: 'https://hoatheomua.com/privacy-policy' }
  }
}

const getItems = (t: PrivacyTranslations, key: string) => Object.values(t.raw(key) as Record<string, string>)

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('legal.privacy')
  const [dataItems, purposeItems, contactItems] = await Promise.all([
    getItems(t, 'data.items'),
    getItems(t, 'purpose.items'),
    getItems(t, 'contact.items')
  ])

  return (
    <LegalDocument appName={t('appName')} title={t('title')} description={t('description')}>
      <LegalSection title={t('introduction.title')}>
        {getItems(t, 'introduction.paragraphs').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </LegalSection>

      <LegalSection title={t('data.title')}>
        <p>{t('data.intro')}</p>
        <LegalList>{dataItems.map((item) => <li key={item}>{item}</li>)}</LegalList>
        <p>{t('data.outro')}</p>
      </LegalSection>

      <LegalSection title={t('purpose.title')}>
        <LegalList>{purposeItems.map((item) => <li key={item}>{item}</li>)}</LegalList>
      </LegalSection>

      <LegalSection title={t('storage.title')}>
        {getItems(t, 'storage.paragraphs').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </LegalSection>

      <LegalSection title={t('sharing.title')}>
        {getItems(t, 'sharing.paragraphs').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </LegalSection>

      <LegalSection title={t('rights.title')}>
        <p>{t('rights.intro')}</p>
        <LegalList>{getItems(t, 'rights.items').map((item) => <li key={item}>{item}</li>)}</LegalList>
      </LegalSection>

      <LegalSection title={t('retention.title')}>
        <p>{t('retention.description')}</p>
      </LegalSection>

      <LegalSection title={t('changes.title')}>
        <p>{t('changes.description')}</p>
      </LegalSection>

      <LegalSection title={t('contact.title')}>
        <dl className='space-y-2'>
          {contactItems.map((item) => {
            const [label, value] = item.split('|')
            return (
              <div key={item}>
                <dt className='inline font-semibold text-primary'>{label}: </dt>
                <dd className='inline'>{value}</dd>
              </div>
            )
          })}
        </dl>
      </LegalSection>
    </LegalDocument>
  )
}
