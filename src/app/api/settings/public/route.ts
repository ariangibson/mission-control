import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDatabase } from '@/lib/db'

const SHOW_PROMO_BANNER_KEY = 'general.show_promo_banner'

function parseBooleanSetting(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') return false
  return fallback
}

/**
 * GET /api/settings/public - Non-sensitive UI settings for authenticated users.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const db = getDatabase()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(SHOW_PROMO_BANNER_KEY) as { value?: string } | undefined
  const showPromoBanner = parseBooleanSetting(row?.value, true)

  return NextResponse.json({ showPromoBanner })
}
