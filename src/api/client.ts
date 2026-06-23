import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { API_BASE_URL } from '@/constants'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Future: attach auth token here
    // const token = useAuthStore.getState().token
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as Record<string, string> | undefined

    // Construct normalized error
    const message =
      data?.message || data?.error || error.message || 'An unexpected error occurred'

    const normalized = {
      status: status ?? 0,
      message,
      originalError: error,
    }

    // Handle specific HTTP statuses globally
    if (status === 401) {
      // Future: redirect to login
      console.warn('[API] Unauthorized — redirect to login')
    }

    if (status === 403) {
      console.warn('[API] Forbidden — insufficient permissions')
    }

    if (status === 500) {
      console.error('[API] Internal server error', error.response?.data)
    }

    return Promise.reject(normalized)
  },
)

export default apiClient
