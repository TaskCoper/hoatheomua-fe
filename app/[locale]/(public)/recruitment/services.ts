import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { Job, JobDescriptionParam, SendRecruitmentRequestForm } from './types'

class RecruitmentRequestService {
  private readonly baseUrl = 'v1/recruitment-requests'
  postRecruitmentRequest = async ({ body }: { body: SendRecruitmentRequestForm }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}`, body)
    return data.value
  }
}
class JobDescription {
  private readonly baseUrl = 'v1/public/job-descriptions'

  getJobDescriptions = async ({
    pageIndex,
    pageSize,
    title,
    location,
    employmentType,
    salaryMin,
    salaryMax
  }: JobDescriptionParam) => {
    const { data } = await api.get<BasePaginationResponse<Job>>(this.baseUrl, {
      params: {
        pageIndex,
        pageSize,
        title,
        location,
        employmentType,
        salaryMin,
        salaryMax
      }
    })

    return data
  }

  getDescriptionById = async (id: string) => {
    const { data } = await api.get<BaseResponse<Job>>(`${this.baseUrl}`, {
      params: {
        id
      }
    })
    return data.value
  }

  getHighestSalaryJobDescription = async () => {
    const { data } = await api.get<BaseResponse<number>>(`v1/job-descriptions/highest-salary`)

    return data.value
  }
}
export const recruitmentRequestService = new RecruitmentRequestService()
export const jobDescriptionService = new JobDescription()
