import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import contactService from '../services'
import { createContactSchema, type ContactFormValues } from '../validations'

const defaultValues: ContactFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  topic: '',
  message: ''
}

export const useContact = () => {
  const { t } = useTranslation()
  const contactSchema = useMemo(() => createContactSchema(t), [t])

  const methods = useForm<ContactFormValues>({
    defaultValues,
    resolver: zodResolver(contactSchema)
  })

  const {
    mutateAsync: createContact,
    isPending: isCreatingContact,
    reset: resetCreate
  } = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      toast.success(t('contact.form.submitted'))
      methods.reset()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return {
    methods,
    createContact,
    isCreatingContact,
    resetCreate
  }
}
