import LegalDocument, { LegalList, LegalSection } from '@/features/legal/components/legal-document'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const getItems = (t: Awaited<ReturnType<typeof getTranslations>>, key: string) =>
  Object.values(t.raw(key) as Record<string, string>)

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.dataDeletion' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: 'https://hoatheomua.com/data-deletion' }
  }
}

export default async function DataDeletionPage() {
  const t = await getTranslations('legal.dataDeletion')

  return (
    <LegalDocument appName={t('appName')} title={t('title')} description={t('description')}>
      <LegalSection title={t('introduction.title')}>
        <p>{t('introduction.description')}</p>
      </LegalSection>

      <LegalSection title={t('revoke.title')}>
        <LegalList ordered>{getItems(t, 'revoke.steps').map((step) => <li key={step}>{step}</li>)}</LegalList>
        <p className='rounded-2xl border-l-4 border-primary/40 bg-secondary/35 px-4 py-3 text-sm text-foreground/85'>
          {t('revoke.note')}
        </p>
      </LegalSection>

      <LegalSection title={t('request.title')}>
        <p>{t('request.intro')}</p>
        <LegalList>{getItems(t, 'request.items').map((item) => <li key={item}>{item}</li>)}</LegalList>
        <p>{t('request.outro')}</p>
      </LegalSection>

      <LegalSection title={t('process.title')}>
        <LegalList>{getItems(t, 'process.steps').map((step) => <li key={step}>{step}</li>)}</LegalList>
        <p>{t('process.note')}</p>
      </LegalSection>

      <LegalSection title={t('notes.title')}>
        <LegalList>{getItems(t, 'notes.items').map((item) => <li key={item}>{item}</li>)}</LegalList>
      </LegalSection>
    </LegalDocument>
  )
}
