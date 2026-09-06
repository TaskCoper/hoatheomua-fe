import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'
import { CARD_MAX_QUANTITY, CARD_MESSAGE_MAX_LENGTH, CARD_NAME_MAX_LENGTH } from './card-data'
import type { CheckoutCard } from './types'

const createCardContentSchema = (t: TranslationFunction) => {
  const name = (label: string) =>
    z
      .string()
      .trim()
      .max(CARD_NAME_MAX_LENGTH, {
        error: t('common.validation.maxLength', { field: label, max: CARD_NAME_MAX_LENGTH })
      })

  return z.object({
    receiver: name(t('orders.checkout.cards.receiver')),
    sender: name(t('orders.checkout.cards.sender')),
    message: z
      .string()
      .trim()
      .min(1, { error: t('orders.checkout.cards.messageRequired') })
      .max(CARD_MESSAGE_MAX_LENGTH, {
        error: t('common.validation.maxLength', {
          field: t('orders.checkout.cards.message'),
          max: CARD_MESSAGE_MAX_LENGTH
        })
      })
  })
}

export const createCheckoutCardSchema = (t: TranslationFunction) => {
  const content = createCardContentSchema(t)
  const quantity = z.number().int().min(1).max(CARD_MAX_QUANTITY)
  const sizeId = z.enum(['s', 'm', 'l'])
  const writingMethod = z.enum(['typed', 'handwritten'])
  const templateId = z.string().min(1)
  const lineId = z.string().min(1, { error: t('orders.checkout.cards.productRequired') })

  return z.discriminatedUnion('type', [
    z.object({ type: z.literal('standard'), templateId, sizeId, content, quantity }),
    z.object({ type: z.literal('ai'), templateId, sizeId, writingMethod, lineId, content, quantity }),
    z.object({
      type: z.literal('history'),
      generatedCardId: z.string().min(1, { error: t('orders.checkout.cards.historyRequired') }),
      lineId,
      content,
      writingMethod,
      quantity
    })
  ])
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
