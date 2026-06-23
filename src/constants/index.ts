export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTS: '/products',
  PRODUCTS_NEW: '/products/new',
  PRODUCTS_EDIT: '/products/:id/edit',
  BRANDS: '/brands',
  BRANDS_NEW: '/brands/new',
  BRANDS_EDIT: '/brands/:id/edit',
  ORDERS: '/orders',
  ORDERS_NEW: '/orders/new',
  ORDERS_DETAIL: '/orders/:id',
  USERS: '/users',
  USERS_NEW: '/users/new',
  USERS_EDIT: '/users/:id/edit',
  SETTINGS: '/settings',
} as const

export const QUERY_KEYS = {
  BRANDS: ['brands'] as const,
  BRAND: (id: number) => ['brands', id] as const,
  PRODUCTS: ['products'] as const,
  PRODUCT: (id: number) => ['products', id] as const,
  USERS: ['users'] as const,
  USER: (id: number) => ['users', id] as const,
  ORDERS: ['orders'] as const,
  ORDER: (id: string) => ['orders', id] as const,
} as const

export const API_BASE_URL = '/api'

export const LOW_STOCK_THRESHOLD = 10
export const OUT_OF_STOCK_THRESHOLD = 0

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  executed: 'Executed',
  canceled: 'Canceled',
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  buy: 'Purchase',
  sell: 'Sale',
}

export const ITEMS_PER_PAGE = 10
