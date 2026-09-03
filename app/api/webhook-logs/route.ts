import { NextResponse } from 'next/server'

// No longer used — orders are fetched live from WooCommerce REST API.
export async function GET() {
  return NextResponse.json({ logs: [] })
}
