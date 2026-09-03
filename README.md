# Bruno Homes - Sales & Orders Dashboard

A real-time, mobile-first sales and order management dashboard connecting directly to WooCommerce via REST API.

## Features

- ⚡ **Live Synchronization:** Real-time order metrics, processing counts, and revenue calculations without local database dependencies.
- 📈 **Dual Wave Order Trends:** 14-day history chart displaying active orders (blue wave) and failed orders (red wave) with smooth 6-second cyclic wave animations.
- 📋 **1-Click Copy & WhatsApp Sharing:** Format and copy order summaries or share directly to WhatsApp with standard order templates.
- 📱 **Mobile-First Design:** Tactile cards, quick call/WhatsApp/email actions, frosted glass bottom navigation, and safe-area padding.
- 🔍 **Instant Search & Filters:** Filter orders by status (*Processing*, *Pending*, *Hold*, *Completed*, *Cancelled*, *Failed*) and live keyword search.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Charts:** Recharts
- **Dates & Formatting:** date-fns

## Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shivagokari/brunohomes-sales-dashboard.git
   cd brunohomes-sales-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   WC_STORE_URL=https://yourstore.com
   WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_WC_STORE_URL=https://yourstore.com
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

## License

Private & Proprietary - Bruno Homes
