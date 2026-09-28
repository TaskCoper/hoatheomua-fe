'use client'

import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StudioImage from '@/features/studio/components/studio-image'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import type { StudioIngredient, StudioProduct } from '@/features/studio/types'
import { STUDIO_NAME_MAX_LENGTH, type StudioFormValues } from '@/features/studio/validations'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/shared/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Controller, type Control } from 'react-hook-form'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'

interface StudioIngredientsStepProps {
  control: Control<StudioFormValues>
  product: StudioProduct
  ingredients: StudioIngredient[]
  onNameChange: () => void
}

export default function StudioIngredientsStep({
  control,
  product,
  ingredients,
  onNameChange
}: StudioIngredientsStepProps) {
  const t = useTranslations('studio')

  const nameField = useRef<HTMLTextAreaElement>(null)
  const isFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)', false)

  useEffect(() => {
    if (isFinePointer) nameField.current?.focus()
  }, [isFinePointer])

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
                ref={(element) => {
                  field.ref(element)
                  nameField.current = element
                }}
                enterKeyHint='done'
                onChange={(event) => {
                  field.onChange(event)
                  onNameChange()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.preventDefault()
                }}
                className='h-auto resize-none rounded-none border-none bg-transparent px-0 font-title text-2xl! font-bold text-primary shadow-none ring-transparent focus-visible:ring-transparent sm:text-4xl! lg:text-5xl!'
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

      <section className='mt-10 sm:mt-14'>
        <StudioStepHeading
          title={t('step1.insideTitle', { name: product.name })}
          description={product.note ?? t('step1.insideNote', { count: ingredients.length })}
        />

        {ingredients.length > 0 ? (
          <div className='mt-6 flex flex-col gap-4 sm:gap-8'>
            {ingredients.map((ingredient, index) => (
              <article
                key={ingredient.id}
                className='grid grid-cols-[3.5rem_1fr] gap-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-4'
              >
                <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                  <StudioImage
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    fill
                    sizes='(min-width: 640px) 4rem, 3.5rem'
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className='object-cover'
                    pendingIconClassName='size-6'
                  />
                </div>

                <div className='flex min-w-0 items-center'>
                  <h3 className='font-title text-base leading-snug font-bold text-pretty text-primary sm:text-lg'>
                    {ingredient.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className='mt-6 text-xs leading-relaxed text-muted-foreground'>{t('step1.noMaterials')}</p>
        )}
      </section>
    </div>
  )
}
