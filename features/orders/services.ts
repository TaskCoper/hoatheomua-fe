import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { assertFeatureEnabled } from '@/shared/feature-flags'
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
  GetOrderDetailCardsParams,
  GetOrdersParams,
  Order,
  OrderDetail,
  OrderDetailCardsResponse,
  OrderStatus,
  SetFinalGeneratedCardPayload,
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

  // Cancelling unwinds a real order upstream (refund, shipment cancellation,
  // notifications), so it rides on the same flag as creating one.
  cancelOrder = async ({ id }: { id: string }) => {
    assertFeatureEnabled('ordering')

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
    // Quoting hits the carrier (Ahamove / Xanh SM) for real.
    assertFeatureEnabled('externalServices')

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

  // One order creation fans out into everything downstream: stock decrement, a
  // payment session, a shipment booking and the order emails/SMS.
  createOrder = async ({ body }: { body: CheckoutPayload }) => {
    assertFeatureEnabled('ordering')

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

  /** The artworks generated so far for one card of a line. */
  getOrderDetailCards = async ({ orderDetailsId, virtualId }: GetOrderDetailCardsParams) => {
    const { data } = await api.get<BaseResponse<OrderDetailCardsResponse>>(`v1/order-details/${orderDetailsId}/cards`, {
      params: { virtualId }
    })

    return data.value.cards
  }

  /**
   * Marks which generation goes to print.
   * TODO(backend): the path is assumed to sit under the ai-cards resource - only
   * `final-generated-card` was given.
   */
  setFinalGeneratedCard = async (body: SetFinalGeneratedCardPayload) => {
    const { data } = await api.put<BaseResponse<unknown>>('v1/final-generated-card', body)

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
