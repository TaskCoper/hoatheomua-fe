'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useMemo } from 'react'
import {
  CHECKOUT_CONFIG_GROUP,
  CHECKOUT_PAYMENT_METHODS_KEY,
  PAYMENT_METHOD_REGISTRY,
  defaultCheckoutMethods,
  parseCheckoutMethods,
  type CheckoutPaymentMethodsConfigItem,
  type CheckoutPaymentOption
} from '../checkout-methods'

export const useCheckoutPaymentMethods = () => {
  const { configs, isGettingConfigs } = useGetPublicConfigs<
    CheckoutPaymentMethodsConfigItem,
    typeof CHECKOUT_PAYMENT_METHODS_KEY
  >({
    group: CHECKOUT_CONFIG_GROUP,
    key: CHECKOUT_PAYMENT_METHODS_KEY,
    options: { retry: false, throwOnError: false }
  })

  const methods = useMemo<CheckoutPaymentOption[]>(() => {
    const collection = parseCheckoutMethods(configs[0]?.value.value, 'payment') ?? defaultCheckoutMethods('payment')
    const definitions = new Map(PAYMENT_METHOD_REGISTRY.map((method) => [method.id, method]))

    return collection.items.flatMap((item) => {
      const definition = definitions.get(item.id)
      if (!definition || !item.enabled) return []
      return [
        {
          ...definition,
          enabled: true,
          isDefault: item.isDefault,
          label: item.label,
          description: item.description
        }
      ]
    })
  }, [configs])

  return {
    methods,
    defaultMethod: methods.find((method) => method.isDefault) ?? methods[0] ?? null,
    isGettingMethods: isGettingConfigs
  }
}
