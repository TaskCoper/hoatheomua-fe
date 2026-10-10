'use client'

import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import coralPink from '@/public/images/Hình content 20-10/Bo-Coral-Pink-L-2026-2.jpg'
import hydrangea from '@/public/images/Hình content 20-10/Tu-cau-bo-kieu-size-S_2026-2.jpg'
import redRose from '@/public/images/Hình content 20-10/Blooming-rose-Ecuador_size-S-3.jpg'
import pinkTone from '@/public/images/Hình content 20-10/Tone-hong-500_2026-2.jpg'
import babyPink from '@/public/images/Hình content 20-10/Bo-Baby-Pink-1.png'
import redBouquet from '@/public/images/Hình content 20-10/Hong-do-ecuador-thanh-lich-2.png'
import delivery from '@/public/images/Hình content 20-10/The-scent-of-wisdom_2026-3.jpg'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'

const FLOWER_MEANINGS = [
  { id: 'rose' },
  { id: 'carnation' },
  { id: 'sunflower' },
  { id: 'orchid' }
] as const

const RECIPIENTS = [
  { id: 'mother', image: pinkTone },
  { id: 'wife', image: redBouquet },
  { id: 'lover', image: babyPink },
  { id: 'colleague', image: null }
] as const

const ArticleImage = ({ image, alt, className }: { image: StaticImageData; alt: string; className?: string }) => (
  <figure
    className={cn(
      'group mx-auto max-w-xl overflow-hidden rounded-3xl bg-secondary/25 ring-1 ring-foreground/5',
      className
    )}
  >
    <Image
      src={image}
      alt={alt}
      width={900}
      height={620}
      className='h-auto w-full scale-100 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]'
    />
    <figcaption className='px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground'>{alt}</figcaption>
  </figure>
)

export default function WomenDayArticleSection() {
  const { t } = useTranslation()
  const whyBody = t('womenDay.article.why.body')
  const [whyBodyBeforeUrl, whyBodyAfterUrl] = whyBody.split('hoatheomua.com')

  return (
    <section className='px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
      <motion.article
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className='mx-auto max-w-6xl space-y-10'
      >
        <motion.div variants={fadeUp} className='mx-auto max-w-full text-center'>
          <h2 className='mt-2 text-balance font-title text-2xl leading-tight font-bold text-primary sm:text-3xl lg:text-4xl'>
            {t('womenDay.article.title')}
          </h2>
          <p className='mt-4 text-sm leading-relaxed text-foreground sm:text-base'>{t('womenDay.article.intro')}</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <ArticleImage image={coralPink} alt={t('womenDay.article.images.pastel')} />
        </motion.div>

        <motion.section variants={fadeUp} className='space-y-4'>
          <h3 className='font-title text-2xl font-bold text-primary sm:text-3xl'>
            {t('womenDay.article.meaning.title')}
          </h3>
          <p className='text-sm leading-relaxed text-foreground sm:text-base'>{t('womenDay.article.meaning.body')}</p>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-3xl bg-secondary/35 p-5'>
              <h4 className='font-title text-xl font-bold text-primary'>
                {t('womenDay.article.meaning.gratitudeTitle')}
              </h4>
              <p className='mt-2 text-sm leading-relaxed text-foreground'>{t('womenDay.article.meaning.gratitude')}</p>
            </div>
            <div className='rounded-3xl bg-secondary/35 p-5'>
              <h4 className='font-title text-xl font-bold text-primary'>{t('womenDay.article.meaning.spiritTitle')}</h4>
              <p className='mt-2 text-sm leading-relaxed text-foreground'>{t('womenDay.article.meaning.spirit')}</p>
            </div>
          </div>
          <ArticleImage image={hydrangea} alt={t('womenDay.article.images.hydrangea')} />
        </motion.section>

        <motion.section variants={fadeUp} className='space-y-4'>
          <h3 className='font-title text-2xl font-bold text-primary sm:text-3xl'>
            {t('womenDay.article.choices.title')}
          </h3>
          <p className='text-sm leading-relaxed text-foreground sm:text-base'>{t('womenDay.article.choices.intro')}</p>
          <div className='space-y-6'>
            {FLOWER_MEANINGS.map((item) => (
              <div key={item.id}>
                <h4 className='font-title text-xl font-bold text-primary sm:text-2xl'>
                  {t(`womenDay.article.choices.items.${item.id}.title`)}
                </h4>
                <p className='mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground'>
                  {t(`womenDay.article.choices.items.${item.id}.body`)}
                </p>
                {item.id === 'rose' ? (
                  <ArticleImage image={redRose} alt={t('womenDay.article.images.rose')} className='mt-5' />
                ) : null}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className='space-y-6'>
          <div>
            <h3 className='font-title text-2xl font-bold text-primary sm:text-3xl'>
              {t('womenDay.article.recipients.title')}
            </h3>
            <p className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>
              {t('womenDay.article.recipients.intro')}
            </p>
          </div>
          <div className='mx-auto max-w-5xl space-y-5'>
            {RECIPIENTS.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'group grid items-start overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5',
                  item.image &&
                    (index % 2 === 1
                      ? 'grid md:grid-cols-[1.3fr_0.7fr]'
                      : 'grid md:grid-cols-[0.7fr_1.3fr]')
                )}
              >
                {item.image ? (
                  <div
                    className={cn(
                      'overflow-hidden bg-muted md:self-start',
                      index % 2 === 1 && 'md:order-2'
                    )}
                  >
                    <Image
                      src={item.image}
                      alt={t(`womenDay.article.recipients.items.${item.id}.title`)}
                      width={800}
                      height={560}
                      className='block h-auto w-full scale-100 object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]'
                    />
                  </div>
                ) : null}
                <div
                  className={cn(
                    'p-4 sm:p-5',
                    item.image && 'flex self-stretch flex-col justify-center',
                    item.image && index % 2 === 1 && 'md:order-1'
                  )}
                >
                  <h4 className='font-title text-xl font-bold text-primary sm:text-2xl'>
                    {t(`womenDay.article.recipients.items.${item.id}.title`)}
                  </h4>
                  <p className='mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground'>
                    {t(`womenDay.article.recipients.items.${item.id}.body`)}
                  </p>
                  {item.id === 'wife' ? (
                    <p className='mt-4 text-sm leading-relaxed text-foreground italic'>
                      {t('womenDay.article.recipients.wifePromo')}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className='space-y-4'>
          <h3 className='font-title text-2xl font-bold text-primary sm:text-3xl'>
            {t('womenDay.article.table.title')}
          </h3>
          <p className='text-sm leading-relaxed text-foreground'>{t('womenDay.article.table.intro')}</p>
          <div className='overflow-x-auto rounded-3xl ring-1 ring-border'>
            <table className='w-full min-w-[42rem] border-collapse text-left text-sm'>
              <thead className='bg-primary text-primary-foreground'>
                <tr>
                  <th className='px-4 py-3 font-semibold'>{t('womenDay.article.table.type')}</th>
                  <th className='px-4 py-3 font-semibold'>{t('womenDay.article.table.highlight')}</th>
                  <th className='px-4 py-3 font-semibold'>{t('womenDay.article.table.for')}</th>
                  <th className='px-4 py-3 font-semibold'>{t('womenDay.article.table.duration')}</th>
                </tr>
              </thead>
              <tbody>
                {(['bouquet', 'basket', 'box', 'stand'] as const).map((row, index) => (
                  <tr key={row} className={index % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}>
                    <td className='px-4 py-3 font-semibold text-primary'>
                      {t(`womenDay.article.table.rows.${row}.type`)}
                    </td>
                    <td className='px-4 py-3 text-foreground'>{t(`womenDay.article.table.rows.${row}.highlight`)}</td>
                    <td className='px-4 py-3 text-foreground'>{t(`womenDay.article.table.rows.${row}.for`)}</td>
                    <td className='px-4 py-3 text-foreground'>{t(`womenDay.article.table.rows.${row}.duration`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className='grid gap-6 rounded-3xl bg-secondary/35 p-5 sm:p-8 md:grid-cols-[1fr_0.8fr] md:items-center'
        >
          <div>
            <h3 className='text-balance font-title text-2xl font-bold text-primary sm:text-3xl'>
              {t('womenDay.article.why.title')}
            </h3>
            <p className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>
              {whyBodyAfterUrl === undefined ? (
                whyBody
              ) : (
                <>
                  {whyBodyBeforeUrl}
                  <a
                    href='https://hoatheomua.com'
                    target='_blank'
                    rel='noreferrer'
                    className='font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/75'
                  >
                    hoatheomua.com
                  </a>
                  {whyBodyAfterUrl}
                </>
              )}
            </p>
            <ul className='mt-4 space-y-2 text-sm leading-relaxed text-foreground'>
              {(['gift', 'shipping'] as const).map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='mt-2 size-1.5 shrink-0 rounded-full bg-primary' />
                  <span>{t(`womenDay.article.why.items.${item}`)}</span>
                </li>
              ))}
            </ul>
            <p className='mt-5 text-sm leading-relaxed text-foreground'>{t('womenDay.article.why.final')}</p>
          </div>
          <ArticleImage image={delivery} alt={t('womenDay.article.images.delivery')} />
        </motion.section>
      </motion.article>
    </section>
  )
}
