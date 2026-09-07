'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useId } from 'react'
import { CARD_TEMPLATES } from '../../../cards/card-data'

interface CardTemplatePickerProps {
  value: string
  onChange: (templateId: string) => void
}

export default function CardTemplatePicker({ value, onChange }: CardTemplatePickerProps) {
  const { t } = useTranslation()
  const groupId = useId()

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>{t('orders.checkout.cards.template')}</p>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className='grid grid-cols-3 gap-2 sm:grid-cols-6'
        aria-label={t('orders.checkout.cards.template')}
      >
        {CARD_TEMPLATES.map((template) => {
          const isActive = template.id === value
          const id = `${groupId}-${template.id}`

          return (
            <label
              key={template.id}
              htmlFor={id}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-2xl border transition-colors',
                'has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/30',
                isActive ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/60 hover:border-border'
              )}
            >
              <RadioGroupItem id={id} value={template.id} className='sr-only hidden' />

              <PreviewImage
                src={template.imageUrl}
                alt={template.name}
                sizes='(min-width: 640px) 8vw, 30vw'
                className='aspect-[3/4] w-full'
              />

              <span
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/80 to-transparent'
              />

              <span className='pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-2'>
                <span className='min-w-0 truncate text-xs font-medium text-white'>{template.name}</span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                    isActive ? 'border-white bg-white text-primary' : 'border-white/60 text-transparent'
                  )}
                >
                  <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                </span>
              </span>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
