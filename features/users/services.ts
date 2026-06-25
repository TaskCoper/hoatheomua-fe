import { apiTaskcoper, BaseResponse } from '@/lib/axios'
import { Me } from './types'
import {
  ForgotPasswordFormValues,
  ResetPassWordFormValue,
  SignInFormValues,
  SignUpFormValues,
  VerifyCodeFormValues,
  VerifyEmailFormValues
} from './validations'

class UserService {
  private readonly baseUrl = 'users'

  getMe = async () => {
    const { data } = await apiTaskcoper.get<BaseResponse<Me>>(`v1/${this.baseUrl}/me`)
    return data.value
  }

  signUp = async ({ body }: { body: SignUpFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<unknown>>(`v1/${this.baseUrl}/register`, body)

    return data
  }

  signIn = async ({ body }: { body: SignInFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`v1/${this.baseUrl}/login`, body)

    return data.value
  }

  signOut = async () => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`v1/${this.baseUrl}/logout`)

    return data.value
  }

  resendCode = async ({ email }: { email: string }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(
      `v1/${this.baseUrl}/resend_verify_account_code?email=${encodeURIComponent(email)}`
    )

    return data.value
  }

  verifyEmail = async ({ body }: { body: VerifyEmailFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<{ accessToken: string; refreshToken: string }>>(
      `v1/${this.baseUrl}/verify_account`,
      body
    )

    return data.value
  }

  forgotPassword = async ({ body }: { body: ForgotPasswordFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`/v1/${this.baseUrl}/forgot_password`, body)

    return data.value
  }

  resetPassword = async ({ body }: { body: ResetPassWordFormValue }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`v1/${this.baseUrl}/change_password`, body)
    return data.value
  }

  verifyForgotPasswordCode = async ({ body }: { body: VerifyCodeFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(
      `v1/${this.baseUrl}/verify_change_password_code`,
      body
    )
    return data.value
  }
}

const userService = new UserService()
export default userService
