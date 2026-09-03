// ─── Shared TypeScript types ───────────────────────────────────────────────────

export interface LineItem {
  id: number
  name: string
  productId: number
  variationId: number
  quantity: number
  subtotal: string
  total: string
  sku: string | null
  image: string | null
}

export interface ShippingLine {
  id: number
  methodTitle: string
  methodId: string
  total: string
}

export interface StatusHistoryEntry {
  status: string
  timestamp: string
  source: 'webhook' | 'manual' | 'resync' | 'initial'
}

// Full order (from /api/orders/[id])
export interface Order {
  id: number
  wcOrderId: number
  status: string
  currency: string
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  customerId: number | null
  billingFirstName: string | null
  billingLastName: string | null
  billingEmail: string | null
  billingPhone: string | null
  billingAddress1: string | null
  billingAddress2: string | null
  billingCity: string | null
  billingState: string | null
  billingPostcode: string | null
  billingCountry: string | null
  billingCompany: string | null
  shippingFirstName: string | null
  shippingLastName: string | null
  shippingPhone: string | null
  shippingAddress1: string | null
  shippingAddress2: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingPostcode: string | null
  shippingCountry: string | null
  shippingCompany: string | null
  shippingMethod: string | null
  subtotal: string
  shippingTotal: string
  taxTotal: string
  discountTotal: string
  total: string
  paymentMethod: string | null
  paymentMethodTitle: string | null
  transactionId: string | null
  customerNote: string | null
  lineItems: LineItem[]
  shippingLines: ShippingLine[]
  statusHistory: StatusHistoryEntry[]
  rawPayload: Record<string, unknown>
  wcCreatedAt: string | null
  wcUpdatedAt: string | null
  wcCompletedAt: string | null
  createdAt: string
  updatedAt: string
  lastWebhookAt: string | null
}

// Lighter shape for list view
export interface OrderListItem {
  id: number
  wcOrderId: number
  status: string
  customerName: string | null
  customerEmail: string | null
  billingPhone: string | null
  shippingPhone?: string | null
  billingFirstName?: string | null
  billingLastName?: string | null
  billingAddress1?: string | null
  billingAddress2?: string | null
  billingCity?: string | null
  billingState?: string | null
  billingPostcode?: string | null
  billingCountry?: string | null
  shippingAddress1: string | null
  shippingAddress2?: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingPostcode?: string | null
  shippingCountry?: string | null
  total: string
  currency: string
  paymentMethodTitle: string | null
  wcCreatedAt: string | null
  lastWebhookAt: string | null
  lineItems?: { name: string; quantity: number }[]
  totalQuantity?: number
}

export interface OrdersResponse {
  orders: OrderListItem[]
  total: number
  page: number
  limit: number
  pages: number
  lastSynced: string | null
}

export interface StatsResponse {
  ordersToday: number
  pendingCount: number
  revenueToday: number
  revenueWeek: number
  processingCount: number
  completedCount: number
  ordersByDay: { date: string; count: number; revenue: number }[]
}

export interface WebhookLog {
  id: number
  wcOrderId: number | null
  topic: string
  signatureValid: boolean
  errorMessage: string | null
  ipAddress: string | null
  createdAt: string
}

// Status metadata
export const STATUS_META: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-700', dotColor: '#eab308' },
  processing: { label: 'Processing', bg: 'bg-blue-100 dark:bg-blue-900/40',    text: 'text-blue-800 dark:text-blue-200',    border: 'border-blue-200 dark:border-blue-700',    dotColor: '#3b82f6' },
  'on-hold':  { label: 'On Hold',    bg: 'bg-amber-100 dark:bg-amber-900/40',  text: 'text-amber-800 dark:text-amber-200',  border: 'border-amber-200 dark:border-amber-700',  dotColor: '#f59e0b' },
  completed:  { label: 'Completed',  bg: 'bg-green-100 dark:bg-green-900/40',  text: 'text-green-800 dark:text-green-200',  border: 'border-green-200 dark:border-green-700',  dotColor: '#22c55e' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-100 dark:bg-red-900/40',      text: 'text-red-800 dark:text-red-200',      border: 'border-red-200 dark:border-red-700',      dotColor: '#ef4444' },
  failed:     { label: 'Failed',     bg: 'bg-red-100 dark:bg-red-900/40',      text: 'text-red-800 dark:text-red-200',      border: 'border-red-200 dark:border-red-700',      dotColor: '#ef4444' },
  refunded:   { label: 'Refunded',   bg: 'bg-purple-100 dark:bg-purple-900/40',text: 'text-purple-800 dark:text-purple-200',border: 'border-purple-200 dark:border-purple-700',dotColor: '#a855f7' },
  trash:      { label: 'Trashed',    bg: 'bg-gray-100 dark:bg-gray-700',       text: 'text-gray-600 dark:text-gray-300',    border: 'border-gray-200 dark:border-gray-600',    dotColor: '#9ca3af' },
}

export function getStatusMeta(status: string) {
  return STATUS_META[status?.toLowerCase()] ?? STATUS_META['pending']
}
