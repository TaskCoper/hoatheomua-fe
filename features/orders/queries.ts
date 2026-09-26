import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import orderService from './services'
import type { GetOrderDetailCardsParams, GetOrdersParams, ShippingLocationType } from './types'

export const ordersQueryKey = ({ pageSize = DEFAULT_PAGE_SIZE, status }: Omit<GetOrdersParams, 'pageIndex'> = {}) =>
  ['orders', pageSize, status ?? null] as const

export const getOrdersQuery = ({ pageSize = DEFAULT_PAGE_SIZE, status }: Omit<GetOrdersParams, 'pageIndex'> = {}) =>
  infiniteQueryOptions({
    queryKey: ordersQueryKey({ pageSize, status }),
    queryFn: ({ pageParam }) => orderService.getOrders({ pageIndex: pageParam, pageSize, status }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    // Page numbers come back from the server; `allPages.length` only covers the
    // case where it echoes a 0/absent `pageIndex`, which would otherwise refetch page 1.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.value.hasNextPage ? (lastPage.value.pageIndex || allPages.length) + 1 : undefined
  })

export const getOrderQuery = ({ orderId }: { orderId: string }) =>
  queryOptions({
    queryKey: ['order', orderId] as const,
    queryFn: () => orderService.getOrder({ orderId })
  })

export const orderDetailCardsQueryKey = ({ orderDetailsId, virtualId }: GetOrderDetailCardsParams) =>
  ['order-detail-cards', orderDetailsId, virtualId] as const

/** The generations of one card; asked for only once its studio is opened. */
export const getOrderDetailCardsQuery = ({ orderDetailsId, virtualId }: GetOrderDetailCardsParams) =>
  queryOptions({
    queryKey: orderDetailCardsQueryKey({ orderDetailsId, virtualId }),
    queryFn: () => orderService.getOrderDetailCards({ orderDetailsId, virtualId })
  })

export const getOrderStatusQuery = ({ orderId }: { orderId: string }) =>
  queryOptions({
    queryKey: ['order-status', orderId] as const,
    queryFn: () => orderService.getOrderStatus({ orderId })
  })

export const getShippingLocationsQuery = ({ type, parentId }: { type: ShippingLocationType; parentId?: number }) =>
  queryOptions({
    queryKey: ['shipping-locations', type, parentId ?? null] as const,
    queryFn: () => orderService.getOrderShippingLocations({ locationVersion: 'v2', type, parentId })
  })

export const getLatLngQuery = ({ address }: { address?: string }) =>
  queryOptions({
    queryKey: ['lat-lng', address] as const,
    queryFn: () => orderService.getLatLngFromAddress({ address })
  })

export const getAddressAutocompleteQuery = ({
  text,
  focus,
  ward,
  city
}: {
  text: string
  focus?: string
  ward?: string
  city?: string
}) =>
  queryOptions({
    queryKey: ['address-autocomplete', text, focus ?? null, ward ?? null, city ?? null] as const,
    queryFn: () => orderService.autocompleteAddress({ text, focus, ward, city })
  })
