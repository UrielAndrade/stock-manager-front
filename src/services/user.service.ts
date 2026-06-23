import apiClient from '@/api/client'
import type { User, CreateUserDTO, UpdateUserDTO, DeleteResponse } from '@/types'

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users/')
    return data ?? []
  },

  create: async (dto: CreateUserDTO): Promise<User> => {
    const { data } = await apiClient.post<User>('/users/', dto)
    return data
  },

  update: async (id: number, dto: UpdateUserDTO): Promise<User> => {
    const { data } = await apiClient.put<User>(`/users/${id}`, dto)
    return data
  },

  delete: async (id: number): Promise<DeleteResponse> => {
    const { data } = await apiClient.delete<DeleteResponse>(`/users/${id}`)
    return data
  },
}
