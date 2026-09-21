'use client'

import { useGetProductSummary } from '@/features/products/hooks/use-get-product-summary'
import { productFamilyQuery } from '@/features/products/queries'
import type { ProductFamilyMember } from '@/features/products/types'
import { generatedFlowersQuery } from '@/features/studio/hooks/use-get-generated-flowers'
import { useStudioPurchase } from '@/features/studio/hooks/use-studio-purchase'
import {
  toStudioIngredients,
  toStudioProduct,
  toStudioSessionBouquet,
  toStudioSessionScene,
  toStudioSessionVersions
} from '@/features/studio/studio-mappers'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

export const useStudioSession = ({ productId, sessionId }: { productId: string; sessionId: string }) => {
  const { data: family, isPending: isGettingProduct, isError: isProductError } = useQuery(productFamilyQuery(productId))
  const {
    data: page,
    isPending: isGettingSession,
    isError: isSessionError
  } = useQuery(generatedFlowersQuery({ sessionId }))

  const session = useMemo(
    () => page?.items.find((item) => item.sessionId === sessionId) ?? page?.items[0],
    [page, sessionId]
  )
  const versions = useMemo(() => toStudioSessionVersions(session?.flowers), [session])

  const [selectedVersionId, setSelectedVersionId] = useState('')

  // The session opens on the image it finished on; the carousel walks back from there.
  const activeVersion = versions.find((item) => item.id === selectedVersionId) ?? versions[versions.length - 1]

  const detail = family?.parent
  const variants = useMemo(
    () => (family?.children ?? []).filter((child): child is ProductFamilyMember => Boolean(child?.id)),
    [family?.children]
  )
  const selectedDetail = variants.find((variant) => variant.id === activeVersion?.productId) ?? detail
  const product = useMemo(
    () => (selectedDetail && detail ? toStudioProduct(selectedDetail, detail) : undefined),
    [detail, selectedDetail]
  )
  const ingredients = useMemo(() => toStudioIngredients(selectedDetail?.materials), [selectedDetail?.materials])

  // The generation carries the ribbon and the wrapping paper but not what they cost, so the
  // two catalogue rows are read back to price the bouquet the way the studio quoted it.
  const trimProductIds = useMemo(
    () => Array.from(new Set([activeVersion?.ribbon?.id, activeVersion?.wrap?.id].filter((id): id is string => !!id))),
    [activeVersion?.ribbon?.id, activeVersion?.wrap?.id]
  )
  const { productSummaryById } = useGetProductSummary({ productIds: trimProductIds })
  // Until both rows land the quote is short of their price, so the bag must wait for them.
  const isPricingTrims = trimProductIds.some((id) => productSummaryById.get(id)?.isResolving ?? true)
  const trimPriceByProductId = useMemo(
    () => new Map(trimProductIds.map((id) => [id, productSummaryById.get(id)?.product?.price ?? null])),
    [productSummaryById, trimProductIds]
  )

  const bouquet = useMemo(
    () =>
      product
        ? toStudioSessionBouquet({ version: activeVersion, product, ingredients, trimPriceByProductId })
        : undefined,
    [activeVersion, ingredients, product, trimPriceByProductId]
  )

  const designName = activeVersion?.name ?? ''

  const { added, addToBag, buyNow, canBuyNow, isPhoneMissing, isAddToBagDisabled, isBuyNowDisabled, resetAdded } =
    useStudioPurchase({
      productId: product?.id ?? '',
      productName: product?.name ?? '',
      designName,
      rootProductId: productId,
      sessionId,
      flowerId: activeVersion?.id ?? '',
      unitPrice: bouquet?.totalAmount ?? 0,
      // Generated with the design, so they go into the bag with it.
      ribbon: bouquet?.ribbon ?? null,
      wrap: bouquet?.wrap ?? null,
      isPriceResolving: isPricingTrims
    })

  // Every version is its own bouquet, so the bag confirmation belongs to the one on screen.
  const selectVersion = (version: { id: string }) => {
    setSelectedVersionId(version.id)
    resetAdded()
  }

  return {
    product,
    mockup: toStudioSessionScene(session?.flowers.find((item) => item.id === activeVersion?.id)?.mockup),
    bouquet,
    designName,
    versions,
    activeVersion,
    activeVersionId: activeVersion?.id ?? '',
    added,
    addToBag,
    buyNow,
    canBuyNow,
    isPhoneMissing,
    isAddToBagDisabled,
    isBuyNowDisabled,
    selectVersion,
    isGettingSession: isGettingProduct || isGettingSession,
    isSessionError: isProductError || isSessionError
  }
}
