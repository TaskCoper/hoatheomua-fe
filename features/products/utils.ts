import type { ErrorResponse } from '@/lib/axios'
import { useCartStore } from '@/stores/cart.store'
import { isAxiosError } from 'axios'
import { PRODUCT_NOT_FOUND_MESSAGE_CODE } from './constants'

/**
 * A product the API has stopped serving - deleted or unpublished between the
 * moment it landed in a cart and the moment that cart is read back.
 */
export const isProductNotFoundError = (error: unknown): boolean => {
  if (!isAxiosError<ErrorResponse>(error)) return false

  return error.response?.status === 404 && error.response.data?.messageCode === PRODUCT_NOT_FOUND_MESSAGE_CODE
}

/**
 * Purges the product from the cart the moment the API reports it gone. Silent by
 * design: the buyer never chose to remove it, and an order carrying an id the
 * backend rejects can only fail at checkout.
 */
export const forgetMissingProduct = (productId: string) => {
  if (typeof window === 'undefined') return

  useCartStore.getState().removeProduct(productId)
}
