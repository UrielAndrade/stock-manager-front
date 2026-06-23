import apiClient from '@/api/client'
import type { Brand, CreateBrandDTO, UpdateBrandDTO, DeleteResponse } from '@/types'

export const brandService = {
  getAll: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<Brand[]>('/brands/')
    return data ?? []
  },

  create: async (dto: CreateBrandDTO): Promise<Brand> => {
    const { data } = await apiClient.post<Brand>('/brands/', dto)
    return data
  },

  update: async (id: number, dto: UpdateBrandDTO): Promise<Brand> => {
    const { data } = await apiClient.put<Brand>(`/brands/${id}`, dto)
    return data
  },

  delete: async (id: number): Promise<DeleteResponse> => {
    const { data } = await apiClient.delete<DeleteResponse>(`/brands/${id}`)
    return data
  },
}
