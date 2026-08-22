import type { BaseResponse } from '@/lib/axios'
import { expect, type Page } from '@playwright/test'

// every taskcoper endpoint wraps its payload in { value }, and the page's request
// context carries the signed-in session, so no token plumbing is needed here
export const unwrap = async <T>(page: Page, url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await page.request.get(url, { headers })

  // toBeOK rather than `expect(response.ok()).toBeTruthy()`: it reports the method, the URL,
  // the status and the response body, which is the difference between "an expectation failed"
  // and knowing why the endpoint refused
  await expect(response, `GET ${url}`).toBeOK()

  const body = (await response.json()) as BaseResponse<T>
  return body.value
}
