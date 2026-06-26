export interface Address {
  id: string
  userId: string
  receiverName: string
  phoneNumber: string
  addressLine: string
  ward: string
  city: string
  country: string
  mapId: string
  latitude: number
  longitude: number
  isDefault: boolean
  createdAt: string
  updatedAt: string | null
}

export interface AddressPayload {
  receiverName: string
  phoneNumber: string
  addressLine: string
  ward: string
  city: string
  country: string
  mapId: string
  latitude: number
  longitude: number
  isDefault: boolean
}
