import { NextRequest, NextResponse } from 'next/server'
import { getWcConfig } from '@/lib/wc'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { url, auth } = getWcConfig()
    const { searchParams } = new URL(request.url)

    const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'))
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')  || '20')))
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const from   = searchParams.get('from')   || ''
    const to     = searchParams.get('to')     || ''

    const params = new URLSearchParams({
      page:     String(page),
      per_page: String(limit),
      orderby:  'date',
      order:    'desc',
    })

    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    if (from) params.set('after',  `${from}T00:00:00`)
    if (to)   params.set('before', `${to}T23:59:59`)

    const res = await fetch(
      `${url}/wp-json/wc/v3/orders?${params}`,
      {
        headers: { Authorization: auth },
        next:    { revalidate: 0 },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `WooCommerce error: ${err}` }, { status: res.status })
    }

    const total  = parseInt(res.headers.get('X-WP-Total') || '0')
    const pages  = parseInt(res.headers.get('X-WP-TotalPages') || '1')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = await res.json()

    const orders = raw.map(mapToListItem)

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      pages,
      lastSynced: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    const msg = error instanceof Error ? error.message : 'Failed to fetch orders from WooCommerce'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToListItem(o: any) {
  const lineItems = (o.line_items || []).map((li: any) => ({
    name: li.name || '',
    quantity: li.quantity || 1,
  }))
  const totalQuantity = lineItems.reduce((s: number, li: any) => s + (li.quantity || 1), 0)

  return {
    id:                 o.id,
    wcOrderId:          o.id,
    status:             o.status,
    currency:           o.currency || 'INR',
    customerName:       `${o.billing?.first_name ?? ''} ${o.billing?.last_name ?? ''}`.trim() || null,
    customerEmail:      o.billing?.email   || null,
    billingPhone:       o.billing?.phone   || null,
    shippingPhone:      o.shipping?.phone  || o.billing?.phone || null,
    billingFirstName:   o.billing?.first_name || null,
    billingLastName:    o.billing?.last_name  || null,
    billingAddress1:    o.billing?.address_1  || null,
    billingAddress2:    o.billing?.address_2  || null,
    billingCity:        o.billing?.city       || null,
    billingState:       o.billing?.state      || null,
    billingPostcode:    o.billing?.postcode   || null,
    billingCountry:     o.billing?.country    || null,
    shippingAddress1:   o.shipping?.address_1 || o.billing?.address_1 || null,
    shippingAddress2:   o.shipping?.address_2 || o.billing?.address_2 || null,
    shippingCity:       o.shipping?.city      || o.billing?.city  || null,
    shippingState:      o.shipping?.state     || o.billing?.state || null,
    shippingPostcode:   o.shipping?.postcode  || o.billing?.postcode || null,
    shippingCountry:    o.shipping?.country   || o.billing?.country  || null,
    total:              o.total,
    paymentMethodTitle: o.payment_method_title || null,
    wcCreatedAt:        o.date_created   || null,
    lastWebhookAt:      o.date_modified  || null,
    lineItems,
    totalQuantity,
  }
}
