import { NextRequest, NextResponse } from 'next/server'
import { getWcConfig } from '@/lib/wc'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { url, auth } = getWcConfig()
    const res = await fetch(
      `${url}/wp-json/wc/v3/orders/${params.id}`,
      {
        headers: { Authorization: auth },
        next:    { revalidate: 0 },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { error: `WooCommerce error: ${err}` },
        { status: res.status }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o: any = await res.json()

    // Map WooCommerce order → our Order shape
    const order = {
      id:                 o.id,
      wcOrderId:          o.id,
      status:             o.status,
      currency:           o.currency || 'INR',

      customerName:       `${o.billing?.first_name ?? ''} ${o.billing?.last_name ?? ''}`.trim() || null,
      customerEmail:      o.billing?.email   || null,
      customerPhone:      o.billing?.phone   || null,
      customerId:         o.customer_id      || null,

      billingFirstName:   o.billing?.first_name   || null,
      billingLastName:    o.billing?.last_name    || null,
      billingEmail:       o.billing?.email        || null,
      billingPhone:       o.billing?.phone        || null,
      billingAddress1:    o.billing?.address_1    || null,
      billingAddress2:    o.billing?.address_2    || null,
      billingCity:        o.billing?.city         || null,
      billingState:       o.billing?.state        || null,
      billingPostcode:    o.billing?.postcode      || null,
      billingCountry:     o.billing?.country      || null,
      billingCompany:     o.billing?.company      || null,

      shippingFirstName:  o.shipping?.first_name  || null,
      shippingLastName:   o.shipping?.last_name   || null,
      shippingPhone:      o.shipping?.phone || o.billing?.phone || null,
      shippingAddress1:   o.shipping?.address_1   || null,
      shippingAddress2:   o.shipping?.address_2   || null,
      shippingCity:       o.shipping?.city        || null,
      shippingState:      o.shipping?.state       || null,
      shippingPostcode:   o.shipping?.postcode     || null,
      shippingCountry:    o.shipping?.country     || null,
      shippingCompany:    o.shipping?.company     || null,
      shippingMethod:     o.shipping_lines?.[0]?.method_title || null,

      subtotal:           String(o.subtotal       ?? '0'),
      shippingTotal:      String(o.shipping_total ?? '0'),
      taxTotal:           String(o.total_tax      ?? '0'),
      discountTotal:      String(o.discount_total ?? '0'),
      total:              String(o.total          ?? '0'),

      paymentMethod:      o.payment_method        || null,
      paymentMethodTitle: o.payment_method_title  || null,
      transactionId:      o.transaction_id        || null,
      customerNote:       o.customer_note         || null,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lineItems: (o.line_items || []).map((item: any) => ({
        id:          item.id,
        name:        item.name        || '',
        productId:   item.product_id  || 0,
        variationId: item.variation_id || 0,
        quantity:    item.quantity    || 1,
        subtotal:    String(item.subtotal ?? '0'),
        total:       String(item.total    ?? '0'),
        sku:         item.sku         || null,
        image:       item.image?.src  || null,
      })),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shippingLines: (o.shipping_lines || []).map((line: any) => ({
        id:          line.id,
        methodTitle: line.method_title || '',
        methodId:    line.method_id    || '',
        total:       String(line.total ?? '0'),
      })),

      statusHistory: [],
      rawPayload:    {},

      wcCreatedAt:   o.date_created   || null,
      wcUpdatedAt:   o.date_modified  || null,
      wcCompletedAt: o.date_completed || null,
      createdAt:     o.date_created   || new Date().toISOString(),
      updatedAt:     o.date_modified  || new Date().toISOString(),
      lastWebhookAt: null,
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch order from WooCommerce' },
      { status: 500 }
    )
  }
}
