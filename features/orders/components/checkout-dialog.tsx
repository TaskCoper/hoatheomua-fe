'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import type { Address } from '@/features/addresses/types'
import { useCartHydrated } from '@/hooks/use-cart-hydrated'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { type CartItem, useCartStore } from '@/stores/cart.store'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { toast } from 'sonner'
import { useCreateOrder } from '../hooks/use-create-order'
import { useEstimateOrder } from '../hooks/use-estimate-order'
import type { CheckoutPayload } from '../types'
import { type CheckoutFormValues } from '../validations'
import { CheckoutFields } from './checkout-fields'
import { CheckoutItemsPreview } from './checkout-items-preview'
import { EstimateResultPanel } from './estimate-result-panel'

export type { CheckoutPayload }

interface CheckoutDialogProps {
  children?: React.ReactNode
  /**
   * Cart lines to check out. Defaults to the entire cart if omitted —
   * pass the user's current selection from the cart page here.
   */
  items?: CartItem[]
  onConfirm?: (payload: CheckoutPayload, shippingServiceId: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CheckoutDialog({
  children,
  items,
  onConfirm,
  open: openProp,
  onOpenChange
}: CheckoutDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const { methods, estimateOrder, isEstimatingOrder, estimatedOrder, resetEstimate } = useEstimateOrder()
  const { createOrder, isCreatingOrder, resetCreate } = useCreateOrder()

  const hasHydrated = useCartHydrated()
  const cartItems = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const checkoutItems = items ?? cartItems

  const [lastPayload, setLastPayload] = useState<CheckoutPayload | null>(null)

  const { addresses, isLoading: isLoadingAddresses } = useGetAddresses({ enabled: open })
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const hasInitializedRef = useRef(false)

  const applyAddress = useCallback(
    (address: Address) => {
      methods.setValue('fullName', address.receiverName ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('phone', address.phoneNumber ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('addressLine', address.addressLine ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('city', address.city ?? '', { shouldDirty: true })
      methods.setValue('ward', address.ward ?? '', { shouldDirty: true })
      methods.setValue('latitude', address.latitude ?? 0, { shouldDirty: true })
      methods.setValue('longitude', address.longitude ?? 0, { shouldDirty: true })
      methods.setValue('mapId', address.mapId ?? '', { shouldDirty: true })
    },
    [methods]
  )

  useEffect(() => {
    if (!open || hasInitializedRef.current || addresses.length === 0) return
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
    hasInitializedRef.current = true
    setSelectedAddressId(defaultAddress.id)
    applyAddress(defaultAddress)
  }, [open, addresses, applyAddress])

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)
    if (!id) {
      methods.reset()
      return
    }
    const address = addresses.find((item) => item.id === id)
    if (address) applyAddress(address)
  }

  const close = () => {
    setOpen(false)
    methods.reset()
    resetEstimate()
    resetCreate()
    setLastPayload(null)
    setSelectedAddressId('')
    hasInitializedRef.current = false
  }

  const onValid = async (values: CheckoutFormValues) => {
    if (checkoutItems.length === 0) {
      toast.error(t('orders.checkout.emptyCart'))
      return
    }

    const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`
    const payload: CheckoutPayload = {
      latitude: values.latitude,
      longitude: values.longitude,
      address: fullAddress,
      shortAddress: fullAddress,
      fullName: values.fullName,
      phone: values.phone,
      remarks: values.remarks ?? '',
      orderTime: values.orderTime ? Math.floor(new Date(values.orderTime).getTime() / 1000) : 0,
      items: checkoutItems.map((item) => ({
        itemId: String(item.productId),
        number: item.quantity
      }))
    }

    try {
      await estimateOrder({ body: payload })
      setLastPayload(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('orders.checkout.estimateError')
      toast.error(t('orders.checkout.estimateError'), { description: message })
    }
  }

  const onInvalid = () => {
    toast.error(t('common.validation.fixErrors'))
  }

  const handleSubmit = methods.handleSubmit(onValid, onInvalid)

  const isCartEmpty = hasHydrated && checkoutItems.length === 0
  const hasResult = !!estimatedOrder

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          methods.reset()
          resetEstimate()
          resetCreate()
          setLastPayload(null)
          setSelectedAddressId('')
          hasInitializedRef.current = false
        }
        setOpen(next)
      }}
    >
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className='sm:max-w-2xl' position='top-center' onInteractOutside={close}>
        <DialogHeader>
          <DialogTitle>{hasResult ? t('orders.checkout.reviewTitle') : t('orders.checkout.title')}</DialogTitle>
          <DialogDescription>
            {hasResult ? t('orders.checkout.reviewDescription') : t('orders.checkout.description')}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          {hasResult ? (
            <EstimateResultPanel
              cartItems={checkoutItems}
              ahamove={estimatedOrder.ahamoveResult}
              products={estimatedOrder.productNhanhResult.data}
              payload={lastPayload}
              isConfirming={isCreatingOrder}
              onBack={() => {
                if (isCreatingOrder) return
                resetEstimate()
              }}
              onConfirm={async (serviceId) => {
                if (!lastPayload) {
                  close()
                  return
                }
                try {
                  await createOrder({ body: lastPayload })
                  checkoutItems.forEach((item) => removeItem(item.lineId))
                  onConfirm?.(lastPayload, serviceId)
                  toast.success(t('orders.checkout.confirmedToast'))
                  close()
                } catch (error) {
                  const message = error instanceof Error ? error.message : t('orders.checkout.createError')
                  toast.error(t('orders.checkout.createError'), { description: message })
                }
              }}
            />
          ) : isLoadingAddresses ? (
            <div className='flex items-center justify-center py-12'>
              <Spinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 overflow-y-auto pr-1'>
              {checkoutItems.length > 0 ? <CheckoutItemsPreview items={checkoutItems} /> : null}

              <CheckoutFields
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
              />

              {isCartEmpty ? <p className='text-sm text-destructive'>{t('orders.checkout.emptyCart')}</p> : null}

              <div className='flex justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={close}>
                  {t('orders.checkout.cancel')}
                </Button>
                <Button type='submit' disabled={isEstimatingOrder || isCartEmpty}>
                  {isEstimatingOrder ? <Spinner /> : null}
                  {t('orders.checkout.submit')}
                </Button>
              </div>
            </form>
          )}
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
