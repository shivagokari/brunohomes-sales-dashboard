export function getWcConfig() {
  const rawUrl = process.env.WC_STORE_URL || ''
  const url = rawUrl.replace(/\/+$/, '')
  const key = process.env.WC_CONSUMER_KEY || ''
  const secret = process.env.WC_CONSUMER_SECRET || ''

  if (!url || !key || !secret) {
    throw new Error('WooCommerce credentials missing. Please check .env.local (WC_STORE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET).')
  }

  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')

  return { url, auth }
}
