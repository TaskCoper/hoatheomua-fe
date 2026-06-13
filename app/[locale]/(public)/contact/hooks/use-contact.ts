import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { ContactFormValues, createContactSchema } from './validations'

const defaultValues: ContactFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  topic: '',
  message: '',
  agreement: false
}

export const useContact = () => {
  const { t } = useTranslation()
  const contactSchema = useMemo(() => createContactSchema(t), [t])

  const methods = useForm<ContactFormValues>({
    defaultValues,
    resolver: zodResolver(contactSchema)
  })

  return { methods }
}
