import { NextResponse } from 'next/server'
import { getWcConfig } from '@/lib/wc'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    const todayStart = istStartOfDay()
    const weekStart  = nDaysAgoIST(6)
    const chartStart = nDaysAgoIST(13)

    // Parallel: today's orders, pending count, processing count
    const [todayRes, pendingRes, processingRes, chartRes] = await Promise.all([
      wcFetch('/orders', new URLSearchParams({ after: todayStart, per_page: '100', status: 'any' })),
      wcFetch('/orders', new URLSearchParams({ status: 'pending', per_page: '1' })),
      wcFetch('/orders', new URLSearchParams({ status: 'processing', per_page: '1' })),
      wcFetch('/orders', new URLSearchParams({
        after:    chartStart,
        per_page: '100',
        status:   'any',
        orderby:  'date',
        order:    'asc',
      })),
    ])

    // Revenue today (exclude cancelled/failed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayOrders: any[] = todayRes.data
    const revenueToday = todayOrders
      .filter((o) => !['cancelled', 'failed', 'refunded', 'trash'].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0)

    // Revenue this week
    const weekRes = await wcFetch('/orders', new URLSearchParams({
      after: weekStart, per_page: '100', status: 'any',
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weekOrders: any[] = weekRes.data
    const revenueWeek = weekOrders
      .filter((o) => !['cancelled', 'failed', 'refunded', 'trash'].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0)

    // Orders by day (last 14 days)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartOrders: any[] = chartRes.data
    const dayMap: Record<string, { count: number; failed: number; revenue: number }> = {}

    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dayMap[key] = { count: 0, failed: 0, revenue: 0 }
    }

    for (const o of chartOrders) {
      const key = o.date_created?.split('T')[0]
      if (key && dayMap[key] !== undefined) {
        const isFailed = ['failed', 'cancelled'].includes((o.status || '').toLowerCase())
        if (isFailed) {
          dayMap[key].failed++
        } else {
          dayMap[key].count++
        }
        if (!['cancelled', 'failed', 'refunded', 'trash'].includes(o.status)) {
          dayMap[key].revenue += parseFloat(o.total || '0')
        }
      }
    }

    return NextResponse.json({
      ordersToday:     todayRes.total || todayOrders.length,
      pendingCount:    pendingRes.total,
      processingCount: processingRes.total,
      completedCount:  0,
      revenueToday,
      revenueWeek,
      ordersByDay: Object.entries(dayMap).map(([date, v]) => ({ date, ...v })),
    })
  } catch (error) {
    console.error('[GET /api/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats from WooCommerce' }, { status: 500 })
  }
}
