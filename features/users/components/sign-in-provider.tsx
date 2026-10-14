'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FormProvider, SubmitHandler } from 'react-hook-form'
import { useForwardedAuthHref } from '../hooks/use-auth-href'
import { useSignIn } from '../hooks/use-sign-in'
import { SignInFormValues } from '../validations'
import SignInForm from './sign-in-form'

export default function SignInProvider() {
  const { t } = useTranslation()
  const { methods, signIn, isSigningIn } = useSignIn()
  const signUpHref = useForwardedAuthHref('/sign-up')

  const onSubmit: SubmitHandler<SignInFormValues> = (body) => {
    signIn({ body })
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
          <SignInForm />

          <div className='space-y-1'>
            <Button className='w-full' disabled={isSigningIn}>
              {isSigningIn ? <Spinner /> : null}
              {t('auth.signIn.submit')}
            </Button>

            <Link href={signUpHref} replace className='block text-center text-sm text-muted-foreground'>
              <Button variant='link'>{t('auth.signIn.signUpPrompt')}</Button>
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
