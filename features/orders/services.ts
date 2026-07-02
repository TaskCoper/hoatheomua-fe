import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import axios from 'axios'
import { AhamoveResult, ProductNhanhResult } from './ahamove.type'
import type {
  CheckoutPayload,
  EstimatePayload,
  GeoResponse,
  GeoResult,
  Order,
  OrderDetail,
  OrderStatus,
  ShippingLocation,
  ShippingLocationType,
  TaxBusinessInfo
} from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

const COMBINING_MARKS = /[̀-ͯ]/g

const normalizeAddress = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/\s+/g, ' ').trim()

const normalizeTaxBusinessInfo = (response: unknown): TaxBusinessInfo | null => {
  const candidate =
    response && typeof response === 'object' ? ((response as { data?: unknown }).data ?? response) : null

  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const raw = candidate as Partial<TaxBusinessInfo>

  if (!raw.id || !raw.name || !raw.address) {
    return null
  }

  return {
    id: String(raw.id),
    name: String(raw.name),
    address: String(raw.address)
  }
}

export const pickBestGeocodeResult = (inputAddress: string, response?: GeoResponse): GeoResult | null => {
  if (!response || response.status !== 'OK' || response.results.length === 0) {
    return null
  }

  const normalizedInput = normalizeAddress(inputAddress)

  const exactMatch = response.results.find((result) => normalizeAddress(result.formatted_address) === normalizedInput)

  if (exactMatch) {
    return exactMatch
  }

  return response.results[0]
}

class OrderService {
  private readonly baseUrl = 'v1/orders'

  getOrders = async () => {
    const { data } = await api.get<BasePaginationResponse<Order>>(`${this.baseUrl}`)

    return data
  }

  estimateOrder = async ({ body }: { body: EstimatePayload }) => {
    const { data } = await api.post<
      BaseResponse<{
        ahamoveResult: AhamoveResult[]
        productNhanhResult: ProductNhanhResult
      }>
    >(`v1/ahamove/estimate`, body)

    return data.value
  }

  lookupTaxCode = async ({ taxCode }: { taxCode: string }) => {
    const { data } = await axios.get<unknown>(`https://api.vietqr.io/v2/business/${encodeURIComponent(taxCode)}`)

    return normalizeTaxBusinessInfo(data)
  }

  createOrder = async ({ body }: { body: CheckoutPayload }) => {
    const { data } = await api.post<
      BaseResponse<{
        ahamoveResult: AhamoveResult[]
        productNhanhResult: ProductNhanhResult
      }>
    >(`${this.baseUrl}`, body)

    return data.value
  }

  getOrder = async ({ orderId }: { orderId: string }) => {
    const { data } = await api.get<BaseResponse<OrderDetail>>(`${this.baseUrl}/${orderId}`)

    return data.value
  }

  getOrderStatus = async ({ orderId }: { orderId: string }) => {
    const { data } = await api.get<BaseResponse<OrderStatus>>(`${this.baseUrl}/${orderId}/status`)

    return data.value
  }

  getOrderShippingLocations = async (body: GetOrderShippingLocationsBody) => {
    const { data } = await api.post<BaseResponse<{ code: number; data: ShippingLocation[] }>>(
      `${this.baseUrl}/shipping-location`,
      {
        filters: body
      }
    )

    return data.value.data
  }

  getLatLngFromAddress = async ({ address }: { address?: string }) => {
    const { data } = await axios.get<GeoResponse>('https://rsapi.goong.io/geocode', {
      params: { address, api_key: process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY }
    })

    return data
  }
}

const orderService = new OrderService()
export default orderService
