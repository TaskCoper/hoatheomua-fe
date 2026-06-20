'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useContact } from '@/features/contact/hooks/use-contact'
import type { ContactPayload } from '@/features/contact/types'
import type { ContactFormValues } from '@/features/contact/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ArrowUpRight03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Controller, FormProvider, SubmitHandler, useFormContext } from 'react-hook-form'

const topicOptions = [
  { value: 'general', labelKey: 'contact.form.topics.general' },
  { value: 'customBouquet', labelKey: 'contact.form.topics.customBouquet' },
  { value: 'eventFlowers', labelKey: 'contact.form.topics.eventFlowers' },
  { value: 'deliverySupport', labelKey: 'contact.form.topics.deliverySupport' }
] as const

function ContactFormFields() {
  const { t } = useTranslation()
  const { control } = useFormContext<ContactFormValues>()

  return (
    <FieldGroup className='gap-1.5'>
      <Controller
        name='fullName'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('contact.form.fullName')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('contact.form.fullNamePlaceholder')}
              autoComplete='name'
              className='h-9 bg-input/40 px-3.5'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='email'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('contact.form.email')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('contact.form.emailPlaceholder')}
              autoComplete='email'
              className='h-9 bg-input/40 px-3.5'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='phoneNumber'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('contact.form.phoneNumber')}</FieldLabel>
            <InputGroup className='h-9 overflow-hidden rounded-3xl bg-input/40'>
              <InputGroupAddon align='inline-start' className='border-r border-border/60 px-3.5 text-foreground'>
                +84
              </InputGroupAddon>
              <InputGroupInput
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('contact.form.phoneNumberPlaceholder')}
                autoComplete='tel'
                className='h-full flex-1 !border-transparent !bg-transparent px-2.5 py-0 !shadow-none outline-none focus-visible:!border-transparent focus-visible:!ring-0 aria-invalid:!border-transparent aria-invalid:!ring-0 [&:-webkit-autofill]:!shadow-[inset_0_0_0_1000px_transparent] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]'
              />
            </InputGroup>
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='topic'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel>{t('contact.form.topic')}</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={fieldState.invalid} className='h-10 w-full bg-input/40 px-3.5'>
                <SelectValue placeholder={t('contact.form.topicPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {topicOptions.map((topic) => (
                  <SelectItem key={topic.value} value={topic.value}>
                    {t(topic.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='message'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('contact.form.message')}</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('contact.form.messagePlaceholder')}
              className='min-h-24 bg-input/40 px-3.5 py-2.5'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />
    </FieldGroup>
  )
}

export default function ContactForm() {
  const { t } = useTranslation()
  const { methods, createContact, isCreatingContact } = useContact()

  const onSubmit: SubmitHandler<ContactFormValues> = async (values) => {
    const payload: ContactPayload = {
      fullName: values.fullName,
      email: values.email,
      topic: values.topic,
      content: values.message,
      phone: `+84${values.phoneNumber.replace(/^\+?84/, '').replace(/\D/g, '')}`
    }

    await createContact({ body: payload })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-2.5'>
        <ContactFormFields />

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:max-lg:flex-col md:max-lg:items-stretch'>
          {/* Unused: agreement is a UI-only field and not part of the POST /contact payload.
          <Controller
            name='agreement'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='min-w-0 flex-1 gap-1'>
                <div className='flex items-start gap-2.5 sm:items-center'>
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={fieldState.invalid}
                    className='mt-0.5 sm:mt-0'
                  />
                  <FieldLabel htmlFor={field.name} className='text-sm leading-snug font-normal text-foreground'>
                    {t('contact.form.agreement')}
                  </FieldLabel>
                </div>
                <div className='min-h-4 pl-6.5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />
          */}

          <div className='z-30 flex shrink-0 flex-col items-start gap-2 sm:items-end md:max-lg:items-stretch sm:ml-auto'>
            <Button
              type='submit'
              size='lg'
              disabled={isCreatingContact}
              className='group/button z-30 px-4 shadow-[0_0.45rem_1.2rem_rgb(81_108_108_/_10%)] md:max-lg:w-full'
            >
              {isCreatingContact ? <Spinner /> : null}
              {isCreatingContact ? t('contact.form.submitting') : t('contact.form.submit')}
              <span className='ml-1 grid size-5.5 place-items-center rounded-full bg-primary-foreground text-primary transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5'>
                <HugeiconsIcon icon={ArrowUpRight03Icon} strokeWidth={2} className='size-3' />
              </span>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
