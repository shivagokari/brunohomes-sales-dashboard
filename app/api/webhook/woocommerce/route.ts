import { NextResponse } from 'next/server'

// Webhook endpoint kept for compatibility but no longer required.
// Orders are fetched live from WooCommerce REST API — no storage needed.
export async function POST() {
  return NextResponse.json({ ok: true })
}
