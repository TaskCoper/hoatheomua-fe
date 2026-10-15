import { z } from 'zod'
import { apiTaskcoper, BaseResponse } from '@/lib/axios'
import { Me, UpdateMePayload, UserProfile } from './types'
import { SignInFormValues, SignUpFormValues } from './validations'

export const otpChallengeSchema = z.object({
  challengeId: z.string().uuid(), expiresInSeconds: z.number().int().positive(), resendAfterSeconds: z.number().int().positive()
})
export type OtpChallenge = z.infer<typeof otpChallengeSchema>
export type PhoneProof = { challengeId: string; code: string }

class UserService {
  private readonly baseUrl = 'users'

  getMe = async () => {
    const { data } = await apiTaskcoper.get<BaseResponse<Me & UserProfile>>(`v2/${this.baseUrl}/me`)

    return data.value
  }

  getUserBySlug = async (slug: string) => {
    const me = await this.getMe()
    if (me.slug === slug) return me
    const { data } = await apiTaskcoper.get<BaseResponse<UserProfile>>(`v1/${this.baseUrl}/${slug}`)

    return data.value
  }

  updateMe = async (body: UpdateMePayload) => {
    const me = await this.getMe()
    const isPhone = me.registrationMethod === 'Phone'
    const payload = isPhone ? {
      firstName: body.firstName, lastName: body.lastName, avatar: body.avatar,
      coverImageUrl: body.coverImageUrl, address: body.address, city: body.city,
      state: body.state, timeZone: body.timeZone
    } : body
    const { data } = await apiTaskcoper.put<BaseResponse<Me>>(`${isPhone ? 'v2' : 'v1'}/${this.baseUrl}/me`, payload)

    return data.value
  }

  signUp = async ({ body }: { body: SignUpFormValues & PhoneProof }) => {
    const { confirmPassword, ...payload } = body
    void confirmPassword
    const { data } = await apiTaskcoper.post<BaseResponse<unknown>>(`v2/${this.baseUrl}/register`, payload)

    return data
  }

  requestPhoneOtp = async (body: { phoneNumber: string; purpose: 'register' | 'reset_password' }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<unknown>>(`v2/${this.baseUrl}/request_phone_otp`, body)
    return otpChallengeSchema.parse(data.value)
  }

  resetPhonePassword = async (body: PhoneProof & { phoneNumber: string; newPassword: string }) => {
    await apiTaskcoper.post(`v2/${this.baseUrl}/reset_phone_password`, body)
  }

  signIn = async ({ body }: { body: SignInFormValues }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<unknown>>(`v2/${this.baseUrl}/login`, body)

    return data.value
  }

  signOut = async () => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`v1/${this.baseUrl}/logout`)

    return data.value
  }

  changePassword = async (body: { currentPassword: string; newPassword: string }) => {
    const { data } = await apiTaskcoper.post<BaseResponse<string>>(`v2/${this.baseUrl}/change_password`, body)

    return data.value
  }
}

const userService = new UserService()
export default userService
