import { NextRequest, NextResponse } from 'next/server'
import { getWcConfig } from '@/lib/wc'

export const dynamic = 'force-dynamic'

// 30-second in-memory cache to make dashboard load blazing fast
let statsCache: { data: any; expiresAt: number } | null = null

// IST start-of-day in UTC
function istStartOfDay(): string {
  const now = new Date()
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffsetMs)
  const midnight = new Date(
    Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
  )
  return new Date(midnight.getTime() - istOffsetMs).toISOString()
}

function nDaysAgoIST(n: number): string {
  const now = new Date()
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffsetMs)
  const d = new Date(
    Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() - n)
  )
  return new Date(d.getTime() - istOffsetMs).toISOString()
}

async function wcFetch(path: string, params: URLSearchParams) {
  const { url, auth } = getWcConfig()
  const res = await fetch(`${url}/wp-json/wc/v3${path}?${params}`, {
    headers: { Authorization: auth },
    next:    { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`WC ${res.status}: ${await res.text()}`)
  return { data: await res.json(), total: parseInt(res.headers.get('X-WP-Total') || '0') }
}

export async function GET(req: NextRequest) {
  try {
    const isManual = req.nextUrl.searchParams.get('refresh') === 'true'
    const now = Date.now()

    // Return cached stats if valid and not manually forced
    if (!isManual && statsCache && statsCache.expiresAt > now) {
      return NextResponse.json(statsCache.data)
    }

    const todayStart = istStartOfDay()
    const weekStart  = nDaysAgoIST(6)
    const chartStart = nDaysAgoIST(13)

    // Execute only 3 parallel queries: processing count, pending count, and the last 14 days orders
    const [processingRes, pendingRes, chartRes] = await Promise.all([
      wcFetch('/orders', new URLSearchParams({ status: 'processing', per_page: '1' })),
      wcFetch('/orders', new URLSearchParams({ status: 'pending', per_page: '1' })),
      wcFetch('/orders', new URLSearchParams({
        after:    chartStart,
        per_page: '100',
        status:   'any',
        orderby:  'date',
        order:    'asc',
      })),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartOrders: any[] = chartRes.data

    // 14-day map for chart
    const dayMap: Record<string, { count: number; failed: number; revenue: number }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dayMap[key] = { count: 0, failed: 0, revenue: 0 }
    }

    let ordersToday = 0
    let revenueToday = 0
    let revenueWeek = 0

    const todayIsoDate = todayStart.split('T')[0]
    const weekStartTime = new Date(weekStart).getTime()
    const todayStartTime = new Date(todayStart).getTime()

    for (const o of chartOrders) {
      const orderDateStr = o.date_created || ''
      const orderTime = new Date(orderDateStr).getTime()
      const key = orderDateStr.split('T')[0]
      const isFailed = ['failed', 'cancelled'].includes((o.status || '').toLowerCase())
      const isRevenueEligible = !['cancelled', 'failed', 'refunded', 'trash'].includes((o.status || '').toLowerCase())
      const amount = parseFloat(o.total || '0')

      // Populate 14-day chart
      if (key && dayMap[key] !== undefined) {
        if (isFailed) {
          dayMap[key].failed++
        } else {
          dayMap[key].count++
        }
        if (isRevenueEligible) {
          dayMap[key].revenue += amount
        }
      }

      // Today's metrics
      if (orderTime >= todayStartTime || key === todayIsoDate) {
        ordersToday++
        if (isRevenueEligible) {
          revenueToday += amount
        }
      }

      // Week's metrics
      if (orderTime >= weekStartTime) {
        if (isRevenueEligible) {
          revenueWeek += amount
        }
      }
    }

    const result = {
      ordersToday,
      pendingCount:    pendingRes.total,
      processingCount: processingRes.total,
      completedCount:  0,
      revenueToday,
      revenueWeek,
      ordersByDay: Object.entries(dayMap).map(([date, v]) => ({ date, ...v })),
    }

    // Cache for 30 seconds
    statsCache = {
      data: result,
      expiresAt: now + 30_000,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats from WooCommerce' }, { status: 500 })
  }
}
