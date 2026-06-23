import apiClient from '@/api/client'
import type { Order, CreateOrderDTO } from '@/types'

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders/')
    return data ?? []
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`)
    return data
  },

  create: async (dto: CreateOrderDTO): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders/', dto)
    return data
  },

  execute: async (id: string): Promise<Order> => {
    const { data } = await apiClient.put<Order>(`/orders/${id}/execute`)
    return data
  },

  cancel: async (id: string): Promise<Order> => {
    const { data } = await apiClient.put<Order>(`/orders/${id}/cancel`)
    return data
  },
}
