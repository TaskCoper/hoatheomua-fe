import api, { BaseResponse } from '@/lib/axios'
import { Me } from './types'
import { SignInFormValues, SignUpFormValues } from './validations'

class AuthService {
  private readonly baseUrl = 'v1/auth'

  getMe = async () => {
    const { data } = await api.get<BaseResponse<Me>>(`${this.baseUrl}/me`)

    return data.value
  }

  signUp = async ({ body }: { body: SignUpFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}/register`, body)

    return data.value
  }

  signIn = async ({ body }: { body: SignInFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}/sign-in`, body)

    return data.value
  }

  signOut = async () => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}/sign-out`)

    return data.value
  }
}

const authService = new AuthService()
export default authService
