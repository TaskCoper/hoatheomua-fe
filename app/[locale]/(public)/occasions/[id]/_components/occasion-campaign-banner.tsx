'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { LocalizedText } from '@/types/config.type'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'

interface OccasionCampaignBannerProps {
  campaignName: LocalizedText
  startDate: string
  endDate: string
}

const formatYMD = (ymd: string, locale: string): string => {
  if (!ymd) return ''
  const [yyyy, mm, dd] = ymd.split('-')
  if (!yyyy || !mm || !dd) return ymd
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  if (Number.isNaN(dt.getTime())) return ymd
  return dt.toLocaleDateString(locale === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function OccasionCampaignBanner({ campaignName, startDate, endDate }: OccasionCampaignBannerProps) {
  const { t, locale } = useTranslation()
  const name = campaignName[locale] || campaignName.vi
  if (!name) return null

  const dates = t('products.occasions.detail.campaign.dates', {
    start: formatYMD(startDate, locale),
    end: formatYMD(endDate, locale)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className='mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2.5 rounded-full bg-card/70 px-3 py-1.5 shadow-[0_0.45rem_1.4rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 backdrop-blur-sm sm:gap-3.5 sm:px-4 sm:py-2'
    >
      <span className='font-title text-xs font-bold text-primary sm:text-sm'>{name}</span>

      <span aria-hidden='true' className='hidden h-3 w-px bg-foreground/15 sm:inline-block' />

      <span className='inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground sm:text-xs'>
        <HugeiconsIcon icon={Calendar03Icon} className='size-3 sm:size-3.5' />
        {dates}
      </span>
    </motion.div>
  )
}
