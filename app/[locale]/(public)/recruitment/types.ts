export type Job = {
  id: string
  slug: string
  title: string
  avatarUrl: string
  coverImageUrl: string
  description?: string | null
  location: string
  employmentType: string
  salaryMin: number
  salaryMax: number
  salaryNegotiable: boolean
  openings: number
  status: string
}
export type SendRecruitmentRequestForm = {
  jobDescriptionId: string
  title: string
  coverLetter: string
  attachments: string[]
}
export type JobDescriptionParam = {
  pageIndex: number
  pageSize: number
  title?: string
  location?: string
  employmentType?: string
  salaryMin?: number
  salaryMax?: number
}

export type RecruitmentSalaryRange = 'below-8' | '8-12' | '12-18' | 'above-18'

export type RecruitmentFilters = {
  title: string
  location?: string
  employmentType?: string
  salaryRange?: RecruitmentSalaryRange
}
