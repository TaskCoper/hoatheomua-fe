import { isAxiosError } from 'axios'
import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'

export function phoneOtpError(error: unknown, t: TranslationFunction) {
  const code = isAxiosError(error) ? error.response?.data?.messageCode : undefined
  if (code === 'InvalidPhoneOtp') return t('auth.phone.otpInvalid')
  if (code === 'PhoneOtpRateLimited' || (isAxiosError(error) && error.response?.status === 429)) return t('auth.phone.otpRateLimited')
  if (code === 'PhoneOtpUnavailable') return t('auth.phone.otpUnavailable')
  if (code === 'PhoneNumberExists') return t('auth.phone.numberExists')
  if (code === 'NewPasswordSameAsOld') return t('auth.phone.passwordReused')
  return t('error.somethingWentWrong')
}
