'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FormProvider, SubmitHandler } from 'react-hook-form'
import { useForwardedAuthHref } from '../hooks/use-auth-href'
import { useSignUp } from '../hooks/use-sign-up'
import { SignUpFormValues } from '../validations'
import SignUpForm from './sign-up-form'

export default function SignUpProvider() {
  const { t } = useTranslation()
  const { methods, signUp, isSigningUp } = useSignUp()
  const signInHref = useForwardedAuthHref('/sign-in')

  const onSubmit: SubmitHandler<SignUpFormValues> = (body) => {
    signUp({ body })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
        <SignUpForm />
        <div className='space-y-1'>
          <Button className='w-full' disabled={isSigningUp}>
            {isSigningUp ? <Spinner /> : null}
            {t('auth.signUp.submit')}
          </Button>
          <Link href={signInHref} replace className='block text-center text-sm text-muted-foreground'>
            <Button variant='link'>{t('auth.signUp.signUpPrompt')}</Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  )
}
