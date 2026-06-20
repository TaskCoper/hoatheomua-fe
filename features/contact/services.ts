import api, { BaseResponse } from '@/lib/axios'
import type { ContactPayload } from './types'

class ContactService {
  private readonly baseUrl = 'v1/contact'

  createContact = async ({ body }: { body: ContactPayload }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}`, body)

    return data.value
  }
}

const contactService = new ContactService()
export default contactService
