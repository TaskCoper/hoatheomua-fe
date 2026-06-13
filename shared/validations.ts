import { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

export const createEmailSchema = (t: TranslationFunction) => {
  return z
    .email({
      error: t('common.validation.email')
    })
    .toLowerCase()
}
