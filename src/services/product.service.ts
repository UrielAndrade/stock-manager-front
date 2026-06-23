import apiClient from '@/api/client'
import type { Product, CreateProductDTO, UpdateProductDTO, DeleteResponse } from '@/types'

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/products/')
    return data ?? []
  },

  create: async (dto: CreateProductDTO): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products/', dto)
    return data
  },

  update: async (id: number, dto: UpdateProductDTO): Promise<Product> => {
    const { data } = await apiClient.put<Product>(`/products/${id}`, dto)
    return data
  },

  delete: async (id: number): Promise<DeleteResponse> => {
    const { data } = await apiClient.delete<DeleteResponse>(`/products/${id}`)
    return data
  },
}
