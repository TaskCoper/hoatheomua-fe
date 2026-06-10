const config = {
  baseURL: process.env.API_BASE_URL as string,
  baseFileUrl: process.env.FILE_BASE_URL as string
} as const

export default config
