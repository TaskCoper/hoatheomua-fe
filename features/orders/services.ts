import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import axios from 'axios'
import type { AhamoveEstimateResult } from './ahamove.type'
import type {
  CheckoutPayload,
  EstimatePayload,
  EstimateResult,
  GeocodeAutocompleteResponse,
  GeocodeResponse,
  GeocodeReverseResponse,
  GeoResponse,
  GetOrdersParams,
  Order,
  OrderDetail,
  OrderStatus,
  ShippingLocation,
  ShippingLocationType
} from './types'
import { ShippingGateway } from './types'
import { toAhamoveQuotes, toXanhSmQuotes } from './utils/normalize-shipping-quotes'
import { normalizeTaxBusinessInfo } from './utils/normalize-tax-business-info'
import type { XanhSmEstimateResult } from './xanhsm.type'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

const ESTIMATE_ENDPOINT: Record<ShippingGateway, string> = {
  [ShippingGateway.Ahamove]: 'v1/ahamove/estimate',
  [ShippingGateway.XanhSm]: 'v1/xanhsm/estimate'
}

class OrderService {
  private readonly baseUrl = 'v1/orders'

  getOrders = async ({ pageIndex, pageSize, status }: GetOrdersParams = {}) => {
    const { data } = await api.get<BasePaginationResponse<Order>>(`${this.baseUrl}`, {
      params: { pageIndex, pageSize, status }
    })

    return data
  }

  cancelOrder = async ({ id }: { id: string }) => {
    const { data } = await api.patch(`${this.baseUrl}/${id}/cancel`)

    return data
  }

  estimateOrder = async ({
    body,
    shippingGateway
  }: {
    body: EstimatePayload
    shippingGateway: ShippingGateway
  }): Promise<EstimateResult> => {
    const endpoint = ESTIMATE_ENDPOINT[shippingGateway]

    if (shippingGateway === ShippingGateway.XanhSm) {
      const { data } = await api.post<BaseResponse<XanhSmEstimateResult>>(endpoint, body)

      return { quotes: toXanhSmQuotes(data.value), products: [] }
    }

    const { data } = await api.post<BaseResponse<AhamoveEstimateResult>>(endpoint, body)

    return { quotes: toAhamoveQuotes(data.value), products: data.value.products ?? [] }
  }

  lookupTaxCode = async ({ taxCode }: { taxCode: string }) => {
    const { data } = await axios.get<unknown>(`https://api.vietqr.io/v2/business/${encodeURIComponent(taxCode)}`)

    return normalizeTaxBusinessInfo(data)
  }

  createOrder = async ({ body }: { body: CheckoutPayload }) => {
    const { data } = await api.post<
      BaseResponse<{
        order_id: number
        mrc_order_id: string
        payment_url: string
      }>
    >(`${this.baseUrl}`, {
      ...body,
      paymentMethod: Number(body.paymentMethod)
    })

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

  autocompleteAddress = async ({
    text,
    focus,
    ward,
    city
  }: {
    text: string
    focus?: string
    ward?: string
    city?: string
  }): Promise<GeocodeAutocompleteResponse> => {
    if (text.trim().length < 2) {
      return { results: [] }
    }

    const { data } = await axios.get<GeocodeAutocompleteResponse>('/api/geocode/autocomplete', {
      params: { text, focus, ward, city }
    })

    return data
  }

  resolveGeocodePlace = async ({ refId }: { refId: string }): Promise<GeocodeResponse> => {
    const { data } = await axios.get<GeocodeResponse>('/api/geocode/place', {
      params: { refId }
    })

    return data
  }

  reverseGeocode = async ({ lat, lng }: { lat: number; lng: number }): Promise<GeocodeReverseResponse> => {
    const { data } = await axios.get<GeocodeReverseResponse>('/api/geocode/reverse', {
      params: { lat, lng }
    })

    return data
  }
}

const orderService = new OrderService()
export default orderService
