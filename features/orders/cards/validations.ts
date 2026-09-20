import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'
import { countWords, getCardMaxWords, type CardConfig } from './card-config'
import { CARD_MAX_QUANTITY } from './card-data'
import type { CheckoutCard } from './types'

const createCardContentSchema = (t: TranslationFunction) =>
  z.object({
    message: z
      .string()
      .trim()
      .min(1, { error: t('orders.checkout.cards.messageRequired') })
  })

export const createCheckoutCardSchema = (t: TranslationFunction, config: CardConfig) => {
  const content = createCardContentSchema(t)
  const quantity = z.number().int().min(1).max(CARD_MAX_QUANTITY)
  const sizeName = z.string().min(1)
  const writingMethod = z.enum(['typed', 'handwritten'])
  const templateId = z.string().min(1)
  // Display-only, so never a reason to fail a submit.
  const templateName = z.string()
  const templateImageUrl = z.string()
  const attachedImage = z.custom<File | null>((value) => value === null || value instanceof File)
  const attachedImageUrl = z.string()
  const lineId = z.string().min(1, { error: t('orders.checkout.cards.productRequired') })

  return z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('standard'),
        templateId,
        templateName,
        templateImageUrl,
        lineId,
        content,
        quantity
      }),
      z.object({
        type: z.literal('ai'),
        templateId,
        templateName,
        templateImageUrl,
        sizeName,
        writingMethod,
        attachedImage,
        attachedImageUrl,
        lineId,
        content,
        quantity
      }),
      z.object({
        type: z.literal('history'),
        generatedCardId: z.string().min(1, { error: t('orders.checkout.cards.historyRequired') }),
        sizeName,
        lineId,
        content,
        writingMethod,
        quantity
      })
    ])
    .superRefine((card, ctx) => {
      // The free card has no size, so it is held to the most generous budget.
      const maxWords = getCardMaxWords(config, card.type === 'standard' ? null : card.sizeName)
      if (maxWords <= 0) return

      if (countWords(card.content.message) > maxWords) {
        ctx.addIssue({
          code: 'custom',
          path: ['content', 'message'],
          message: t('orders.checkout.cards.messageMaxWords', { max: maxWords })
        })
      }
    })
}

export type CheckoutCardSchema = ReturnType<typeof createCheckoutCardSchema>

export const EMPTY_ISSUE_PATHS: ReadonlySet<string> = new Set<string>()

/**
 * Trả về tập hợp các đường dẫn (dạng `content.message`, `lineId`, ...) của những field đang bị lỗi
 * trong draft, để mỗi form thiệp có thể tự bôi đỏ field của mình dựa trên đúng schema dùng khi submit.
 */
export const getCardIssuePaths = (schema: CheckoutCardSchema, card: CheckoutCard): ReadonlySet<string> => {
  const parsed = schema.safeParse(card)
  if (parsed.success) return EMPTY_ISSUE_PATHS

  return new Set(parsed.error.issues.map((issue) => issue.path.join('.')))
}
