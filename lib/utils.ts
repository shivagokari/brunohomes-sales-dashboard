import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: string | number, currency = 'INR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// ─── Dates ────────────────────────────────────────────────────────────────────

function safeParse(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  const d = safeParse(dateStr)
  return d ? format(d, 'MMM d, yyyy') : '—'
}

export function formatDateTime(dateStr: string | null | undefined): string {
  const d = safeParse(dateStr)
  return d ? format(d, 'MMM d, yyyy h:mm a') : '—'
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  const d = safeParse(dateStr)
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

export function formatShortDate(dateStr: string | null | undefined): string {
  const d = safeParse(dateStr)
  return d ? format(d, 'dd MMM') : '—'
}

// ─── Address ──────────────────────────────────────────────────────────────────

export function buildAddress(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(', ')
}

// ─── WooCommerce Payload Parser ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseWooCommerceOrder(payload: any) {
  const billing  = payload.billing  || {}
  const shipping = payload.shipping || {}
  const shippingLines: any[] = payload.shipping_lines || []

  const customerName = [billing.first_name, billing.last_name].filter(Boolean).join(' ').trim() || 'Unknown'
  const shippingMethod = shippingLines[0]?.method_title || ''

  return {
    wcOrderId: payload.id as number,
    status:    (payload.status as string) || 'pending',
    currency:  (payload.currency as string) || 'INR',

    customerName,
    customerEmail: (billing.email as string) || '',
    customerPhone: (billing.phone as string) || '',
    customerId:    (payload.customer_id as number) || null,

    // Billing
    billingFirstName: (billing.first_name as string) || '',
    billingLastName:  (billing.last_name  as string) || '',
    billingEmail:     (billing.email      as string) || '',
    billingPhone:     (billing.phone      as string) || '',
    billingAddress1:  (billing.address_1  as string) || '',
    billingAddress2:  (billing.address_2  as string) || '',
    billingCity:      (billing.city       as string) || '',
    billingState:     (billing.state      as string) || '',
    billingPostcode:  (billing.postcode   as string) || '',
    billingCountry:   (billing.country    as string) || '',
    billingCompany:   (billing.company    as string) || '',

    // Shipping
    shippingFirstName: (shipping.first_name as string) || '',
    shippingLastName:  (shipping.last_name  as string) || '',
    shippingPhone:     (shipping.phone      as string) || (billing.phone as string) || '',
    shippingAddress1:  (shipping.address_1  as string) || '',
    shippingAddress2:  (shipping.address_2  as string) || '',
    shippingCity:      (shipping.city       as string) || '',
    shippingState:     (shipping.state      as string) || '',
    shippingPostcode:  (shipping.postcode   as string) || '',
    shippingCountry:   (shipping.country    as string) || '',
    shippingCompany:   (shipping.company    as string) || '',
    shippingMethod,

    // Totals
    subtotal:      String(payload.subtotal       ?? '0'),
    shippingTotal: String(payload.shipping_total ?? '0'),
    taxTotal:      String(payload.total_tax      ?? '0'),
    discountTotal: String(payload.discount_total ?? '0'),
    total:         String(payload.total          ?? '0'),

    // Payment
    paymentMethod:      (payload.payment_method       as string) || '',
    paymentMethodTitle: (payload.payment_method_title as string) || '',
    transactionId:      (payload.transaction_id       as string) || '',

    // Notes
    customerNote: (payload.customer_note as string) || '',

    // Line items
    lineItems: ((payload.line_items as any[]) || []).map((item: any) => ({
      id:          item.id          as number,
      name:        (item.name       as string) || '',
      productId:   (item.product_id  as number) || 0,
      variationId: (item.variation_id as number) || 0,
      quantity:    (item.quantity   as number) || 1,
      subtotal:    String(item.subtotal ?? '0'),
      total:       String(item.total    ?? '0'),
      sku:         (item.sku        as string) || null,
      image:       (item.image?.src as string) || null,
    })),

    // Shipping lines
    shippingLines: shippingLines.map((line: any) => ({
      id:          line.id           as number,
      methodTitle: (line.method_title as string) || '',
      methodId:    (line.method_id   as string) || '',
      total:       String(line.total ?? '0'),
    })),

    rawPayload: payload,

    wcCreatedAt:   payload.date_created   ? new Date(payload.date_created as string)   : null,
    wcUpdatedAt:   payload.date_modified  ? new Date(payload.date_modified  as string)  : null,
    wcCompletedAt: payload.date_completed ? new Date(payload.date_completed as string) : null,
    lastWebhookAt: new Date(),
  }
}

// ─── Order Sharing Formatter ───────────────────────────────────────────────────

export function formatOrderForSharing(order: {
  wcOrderId?: number;
  customerName?: string | null;
  billingFirstName?: string | null;
  billingLastName?: string | null;
  customerEmail?: string | null;
  billingPhone?: string | null;
  shippingPhone?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostcode?: string | null;
  shippingCountry?: string | null;
  billingAddress1?: string | null;
  billingAddress2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostcode?: string | null;
  billingCountry?: string | null;
  paymentMethodTitle?: string | null;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineItems?: any[];
  totalQuantity?: number;
}): string {
  const orderNum = order.wcOrderId ? `#${order.wcOrderId}` : '—';

  const name =
    order.customerName ||
    [order.billingFirstName, order.billingLastName].filter(Boolean).join(' ').trim() ||
    '—';

  const number = order.billingPhone || order.shippingPhone || '—';
  const mail = order.customerEmail || '—';

  const addrParts = [
    order.shippingAddress1 || order.billingAddress1,
    order.shippingAddress2 || order.billingAddress2,
    order.shippingCity || order.billingCity,
    order.shippingState || order.billingState,
    order.shippingPostcode || order.billingPostcode,
    order.shippingCountry || order.billingCountry,
  ].filter(Boolean);
  const shippingAddress = addrParts.join(', ') || '—';

  const paymentVia = order.paymentMethodTitle || '—';

  const items = order.lineItems || [];
  const howManyPieces =
    order.totalQuantity !== undefined
      ? order.totalQuantity
      : items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

  const productNames =
    items.length > 0
      ? items
          .map((it) => (it.quantity > 1 ? `${it.name} (Qty: ${it.quantity})` : it.name))
          .join(', ')
      : '—';

  const statusMap: Record<string, string> = {
    pending: 'Payment Pending',
    processing: 'Processing',
    'on-hold': 'Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  const normStatus = (order.status || '').toLowerCase();
  const statusFormatted = statusMap[normStatus] || order.status || '—';

  return [
    `Order Number: ${orderNum}`,
    `Name: ${name}`,
    `Number: ${number}`,
    `Mail ID: ${mail}`,
    `Shipping Address: ${shippingAddress}`,
    `Payment via: ${paymentVia}`,
    `How many pieces: ${howManyPieces}`,
    `Name of the product: ${productNames}`,
    `Status: ${statusFormatted}`,
  ].join('\n');
}

