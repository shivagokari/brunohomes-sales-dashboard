import { NextResponse } from 'next/server'

// No-op — orders are fetched live from WooCommerce REST API. No sync needed.
export async function POST() {
  return NextResponse.json({ synced: 0, errors: [] })
}
