'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useMemo } from 'react'
import {
  CHECKOUT_CONFIG_GROUP,
  CHECKOUT_DELIVERY_METHODS_KEY,
  DELIVERY_METHOD_REGISTRY,
  defaultCheckoutMethods,
  parseCheckoutMethods,
  type CheckoutDeliveryMethodsConfigItem,
  type CheckoutDeliveryOption
} from '../checkout-methods'
import type { ShippingGateway, ShippingQuote } from '../types'

interface UseCheckoutDeliveryMethodsArgs {
  quotes: ShippingQuote[]
  estimatedGateway: ShippingGateway | null
}

export const useCheckoutDeliveryMethods = ({ quotes, estimatedGateway }: UseCheckoutDeliveryMethodsArgs) => {
  const { configs, isGettingConfigs } = useGetPublicConfigs<
    CheckoutDeliveryMethodsConfigItem,
    typeof CHECKOUT_DELIVERY_METHODS_KEY
  >({
    group: CHECKOUT_CONFIG_GROUP,
    key: CHECKOUT_DELIVERY_METHODS_KEY,
    options: { retry: false, throwOnError: false }
  })

  const methods = useMemo<CheckoutDeliveryOption[]>(() => {
    const collection = parseCheckoutMethods(configs[0]?.value.value, 'delivery') ?? defaultCheckoutMethods('delivery')
    const definitions = new Map(DELIVERY_METHOD_REGISTRY.map((method) => [method.id, method]))

    return collection.items.flatMap((item) => {
      const definition = definitions.get(item.id)
      if (!definition || !item.enabled) return []

      const quote =
        definition.shippingGateway === estimatedGateway
          ? quotes.find((candidate) => !candidate.serviceId || candidate.serviceId === definition.serviceId)
          : undefined

      return [
        {
          ...definition,
          enabled: true,
          isDefault: item.isDefault,
          label: item.label,
          description: item.description,
          quote
        }
      ]
    })
  }, [configs, quotes, estimatedGateway])

  return {
    methods,
    defaultMethod: methods.find((method) => method.isDefault) ?? methods[0] ?? null,
    isGettingMethods: isGettingConfigs
  }
}
