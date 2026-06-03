'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FormProvider, SubmitHandler } from 'react-hook-form'
import { useSignIn } from '../hooks/use-sign-in'
import { SignInFormValues } from '../validations'
import SignInForm from './sign-in-form'

export default function SignInProvider() {
  const { t } = useTranslation()
  const { methods } = useSignIn()

  const onSubmit: SubmitHandler<SignInFormValues> = (body) => {
    console.log(body)
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
          <SignInForm />

          <div className='space-y-1'>
            <Button className='w-full'>{t('auth.signIn.submit')}</Button>
            <Link href='/sign-up' className='block text-center text-sm text-muted-foreground'>
              <Button variant='link'>{t('auth.signIn.signUpPrompt')}</Button>
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
