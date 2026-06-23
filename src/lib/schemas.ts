import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Brand Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createBrandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  country: z.string().min(1, 'Country is required'),
  email: z.string().email('Must be a valid email address'),
  foundation_year: z
    .number()
    .int()
    .gt(1800, 'Must be after 1800')
    .lte(new Date().getFullYear(), `Must not exceed ${new Date().getFullYear()}`),
})

export const updateBrandSchema = createBrandSchema.partial()

export type CreateBrandFormData = z.infer<typeof createBrandSchema>
export type UpdateBrandFormData = z.infer<typeof updateBrandSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Product Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().gt(0, 'Price must be greater than zero'),
  brand_id: z.number().int().gt(0, 'Please select a brand'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>

// ─────────────────────────────────────────────────────────────────────────────
// User Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birthday: z.string().min(1, 'Birthday is required'),
  address: z.string().min(1, 'Address is required'),
  cpf: z
    .string()
    .min(1, 'CPF is required')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF must be in format 000.000.000-00'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).optional().or(z.literal('')),
  birthday: z.string().optional(),
  address: z.string().optional(),
  cpf: z.string().optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Order Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  user_id: z.coerce.number().int().positive('User is required'),
  product_id: z.coerce.number().int().positive('Product is required'),
  quantity: z.number().int().gt(0, 'Quantity must be greater than zero'),
  price: z.number().gt(0, 'Price must be greater than zero'),
  type: z.enum(['buy', 'sell'], { message: 'Type must be buy or sell' }),
})

export type CreateOrderFormData = z.infer<typeof createOrderSchema>
