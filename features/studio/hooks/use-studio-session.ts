'use client'

import { productDetailQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import { generatedFlowersQuery } from '@/features/studio/hooks/use-get-generated-flowers'
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
  const { data: detail, isPending: isGettingProduct, isError: isProductError } = useQuery(productDetailQuery(productId))
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
  const [added, setAdded] = useState(false)

  // The session opens on the image it finished on; the carousel walks back from there.
  const activeVersion = versions.find((item) => item.id === selectedVersionId) ?? versions[versions.length - 1]

  const variants = useMemo(
    () => (detail?.children ?? []).filter((child): child is ProductDetail => Boolean(child?.id)),
    [detail?.children]
  )
  const selectedDetail = variants.find((variant) => variant.id === activeVersion?.productId) ?? detail
  const product = useMemo(
    () => (selectedDetail && detail ? toStudioProduct(selectedDetail, detail) : undefined),
    [detail, selectedDetail]
  )
  const ingredients = useMemo(() => toStudioIngredients(selectedDetail?.materials), [selectedDetail?.materials])

  const bouquet = useMemo(
    () => (product ? toStudioSessionBouquet({ version: activeVersion, product, ingredients }) : undefined),
    [activeVersion, ingredients, product]
  )

  const selectVersion = (version: { id: string }) => {
    setSelectedVersionId(version.id)
    setAdded(false)
  }

  return {
    product,
    mockup: toStudioSessionScene(session?.flowers.find((item) => item.id === activeVersion?.id)?.mockup),
    bouquet,
    designName: activeVersion?.name ?? '',
    versions,
    activeVersion,
    activeVersionId: activeVersion?.id ?? '',
    added,
    addToBag: () => setAdded(true),
    selectVersion,
    isGettingSession: isGettingProduct || isGettingSession,
    isSessionError: isProductError || isSessionError
  }
}
