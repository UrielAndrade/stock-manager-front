// ─────────────────────────────────────────────────────────────────────────────
// Brand Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  country: string
  email: string
  foundation_year: number
}

export interface CreateBrandDTO {
  name: string
  country: string
  email: string
  foundation_year: number
}

export interface UpdateBrandDTO {
  name?: string
  country?: string
  email?: string
  foundation_year?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  id: number
  brand_id: number
  name: string
  price: number
  quantity: number
}

export interface CreateProductDTO {
  name: string
  price: number
  brand_id: number
  quantity: number
}

export interface UpdateProductDTO {
  name?: string
  price?: number
  brand_id?: number
  quantity?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// User Types
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  birthday: string
  address: string
  cpf: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  birthday: string
  address: string
  cpf: string
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
  birthday?: string
  address?: string
  cpf?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Types
// ─────────────────────────────────────────────────────────────────────────────

export type OrderType = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'executed' | 'canceled'

export interface Order {
  id: string // UUID
  user_id: string // UUID
  product_id: string // UUID (note: this maps to product UUID, but products use int IDs)
  quantity: number
  price: number
  type: OrderType
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface CreateOrderDTO {
  user_id: string
  product_id: string
  quantity: number
  price: number
  type: OrderType
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DeleteResponse {
  message: string
}

export interface ApiError {
  error: string
  message: string
  status: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / Derived Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number
  totalBrands: number
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  executedOrders: number
  canceledOrders: number
  totalStockValue: number
  lowStockProducts: Product[]
  outOfStockProducts: Product[]
}

export interface StockChartData {
  name: string
  value: number
  quantity: number
}

export interface OrdersChartData {
  name: string
  value: number
}
