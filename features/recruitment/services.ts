import { Job, JobDescriptionParam, JobDetail, SendRecruitmentRequestForm } from '@/features/recruitment/types'
import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'

class RecruitmentRequestService {
  private readonly baseUrl = 'v1/recruitment-requests'
  postRecruitmentRequest = async ({ body }: { body: SendRecruitmentRequestForm }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}`, body)
    return data.value
  }
}

class JobDescription {
  private readonly baseUrl = 'job-descriptions'

  getJobDescriptions = async ({
    pageIndex,
    pageSize,
    title,
    location,
    employmentType,
    salaryMin,
    salaryMax
  }: JobDescriptionParam) => {
    const { data } = await api.get<BasePaginationResponse<Job>>(`v1/public/${this.baseUrl}`, {
      params: {
        page: pageIndex,
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

  getDescription = async ({ slug }: { slug: string }) => {
    const { data } = await api.get<BaseResponse<JobDetail>>(`v1/public/${this.baseUrl}/${slug}`)

    return data.value
  }

  getJobLocations = async () => {
    const { data } = await api.get<BaseResponse<string[]>>(`v1/${this.baseUrl}/locations`)

    return data.value
  }

  getHighestSalary = async () => {
    const { data } = await api.get<BaseResponse<{ salary: number }>>(`v1/${this.baseUrl}/highest-salary`)

    return data.value.salary
  }
}
export const recruitmentRequestService = new RecruitmentRequestService()
export const jobDescriptionService = new JobDescription()
