export type UserAddressDto = {
    id: string
    receiverName: string
    receiverPhone: string
    province: string
    district: string
    ward: string
    detailedAddress: string
    isDefault: boolean
    fullAddress: string
  }
  
  export type UpsertUserAddressPayload = {
    id?: string
    userId?: string
    receiverName: string
    receiverPhone: string
    province: string
    district?: string
    ward: string
    detailedAddress: string
    isDefault?: boolean
  }
  
  export type UserAddressMutationResponse = {
    success: boolean
    message: string
    id: string
  }