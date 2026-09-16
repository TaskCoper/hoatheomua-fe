'use client'

import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import type { StudioIngredient, StudioProduct } from '@/features/studio/types'
import { STUDIO_NAME_MAX_LENGTH, type StudioFormValues } from '@/features/studio/validations'
import { cn } from '@/shared/utils'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Controller, type Control } from 'react-hook-form'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'

interface StudioIngredientsStepProps {
  control: Control<StudioFormValues>
  product: StudioProduct
  ingredients: StudioIngredient[]
  actions?: ReactNode
  onNameChange: () => void
}

export default function StudioIngredientsStep({
  control,
  product,
  ingredients,
  actions,
  onNameChange
}: StudioIngredientsStepProps) {
  const t = useTranslations('studio')
  const tIngredients = useTranslations('studio.ingredients')

  return (
    <div className='animate-in fade-in slide-in-from-right-2 duration-300'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='mt-7 gap-1'>
            <Label htmlFor={field.name} className={cn(microLabelClass, 'text-xs')}>
              {t('step1.nameLabel')}
            </Label>
            <div
              className={cn(
                'flex items-end gap-3 bg-transparent transition-colors',
                fieldState.invalid ? 'border-destructive' : 'border-input focus-within:border-ring'
              )}
            >
              <Textarea
                {...field}
                id={field.name}
                rows={1}
                maxLength={STUDIO_NAME_MAX_LENGTH}
                aria-invalid={fieldState.invalid}
                aria-describedby='design-name-help'
                placeholder={t('step1.namePlaceholder')}
                spellCheck={false}
                autoFocus
                onChange={(event) => {
                  field.onChange(event)
                  onNameChange()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.preventDefault()
                }}
                className='resize-none font-title border-none ring-transparent text-primary shadow-none px-0 text-5xl! h-auto rounded-none font-bold focus-visible:ring-transparent bg-transparent'
              />

              <span className='text-[0.625rem] tabular-nums text-muted-foreground'>
                {field.value.length}/{STUDIO_NAME_MAX_LENGTH}
              </span>
            </div>
            <p
              id='design-name-help'
              className={cn('text-xs', fieldState.invalid ? 'text-destructive' : 'text-muted-foreground')}
            >
              {fieldState.error?.message || t('step1.nameHelp')}
            </p>
          </Field>
        )}
      />

      <section className='mt-14'>
        <StudioStepHeading
          title={t('step1.insideTitle', { name: product.name })}
          description={product.note}
          actions={actions}
        />

        <div className='mt-6 flex flex-col gap-8'>
          {ingredients.map((ingredient, index) => {
            const name = tIngredients(`${ingredient.id}.name`)
            const amount = tIngredients(`${ingredient.id}.amount`, { count: ingredient.baseQuantity })
            const color = tIngredients(`${ingredient.id}.color`)
            const meaning = tIngredients(`${ingredient.id}.meaning`)

            return (
              <article
                key={ingredient.id}
                className='grid gap-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,4rem)_1fr]'
              >
                <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                  <Image
                    src={ingredient.imageUrl}
                    alt={name}
                    fill
                    sizes='(min-width: 1024px) 11rem, (min-width: 640px) 30vw, 100vw'
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className='object-cover'
                  />
                </div>

                <div className='min-w-0'>
                  <p className={microLabelClass}>
                    {amount} · {color}
                  </p>
                  <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{name}</h3>
                  <p className='text-xs leading-relaxed text-muted-foreground'>{meaning}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* <section className='bg-card/40 rounded-3xl p-6 mt-14 flex flex-col gap-4'>
        <dl className='flex flex-col divide-y divide-border'>
          {STUDIO_DETAIL_KEYS.map((key) => (
            <div key={key} className='grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'>
              <dt className='text-xs font-semibold text-primary'>{t(`step1.details.${key}.label`)}</dt>
              <dd className='text-xs leading-relaxed text-muted-foreground'>{t(`step1.details.${key}.value`)}</dd>
            </div>
          ))}
        </dl>
      </section> */}

      <p className='flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground mt-6'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('step1.detailsNote')}
      </p>
    </div>
  )
}
