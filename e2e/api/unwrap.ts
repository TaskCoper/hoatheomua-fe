import type { BaseResponse } from '@/lib/axios'
import { expect, type Page } from '@playwright/test'

// every taskcoper endpoint wraps its payload in { value }, and the page's request
// context carries the signed-in session, so no token plumbing is needed here
export const unwrap = async <T>(page: Page, url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await page.request.get(url, { headers })
  expect(response.ok(), `GET ${url} -> ${response.status()}`).toBeTruthy()

  const body = (await response.json()) as BaseResponse<T>
  return body.value
}
