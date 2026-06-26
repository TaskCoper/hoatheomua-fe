import { queryOptions } from '@tanstack/react-query'
import orderService from './services'
import type { ShippingLocationType } from './types'

export const getOrdersQuery = () =>
  queryOptions({
    queryKey: ['orders'] as const,
    queryFn: () => orderService.getOrders()
  })

export const getOrderQuery = ({ orderId }: { orderId: string }) =>
  queryOptions({
    queryKey: ['order', orderId] as const,
    queryFn: () => orderService.getOrder({ orderId })
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
