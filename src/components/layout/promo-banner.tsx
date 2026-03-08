'use client'

import { useEffect, useState } from 'react'

const PROMO_BANNER_STORAGE_KEY = 'mc.showPromoBanner'

export function PromoBanner() {
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(PROMO_BANNER_STORAGE_KEY)
    return stored === 'true'
  })
  const [resolvedPreference, setResolvedPreference] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(PROMO_BANNER_STORAGE_KEY)
    return stored === 'true' || stored === 'false'
  })

  useEffect(() => {
    if (resolvedPreference) return

    let cancelled = false

    const loadBannerPreference = async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) {
            setShowBanner(true)
            setResolvedPreference(true)
          }
          return
        }
        const data = await res.json()
        if (!cancelled && typeof data?.showPromoBanner === 'boolean') {
          setShowBanner(data.showPromoBanner)
          try {
            window.localStorage.setItem(PROMO_BANNER_STORAGE_KEY, data.showPromoBanner ? 'true' : 'false')
          } catch {
            // Ignore storage failures in private mode/restricted environments.
          }
          setResolvedPreference(true)
        } else if (!cancelled) {
          setShowBanner(true)
          setResolvedPreference(true)
        }
      } catch {
        if (!cancelled) {
          setShowBanner(true)
          setResolvedPreference(true)
        }
      }
    }

    loadBannerPreference()
    return () => {
      cancelled = true
    }
  }, [resolvedPreference])

  useEffect(() => {
    const onVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ show?: unknown }>
      if (typeof customEvent.detail?.show === 'boolean') {
        setShowBanner(customEvent.detail.show)
        setResolvedPreference(true)
        try {
          window.localStorage.setItem(PROMO_BANNER_STORAGE_KEY, customEvent.detail.show ? 'true' : 'false')
        } catch {
          // Ignore storage failures in private mode/restricted environments.
        }
      }
    }

    window.addEventListener('mc:promo-banner-visibility', onVisibilityChange)
    return () => window.removeEventListener('mc:promo-banner-visibility', onVisibilityChange)
  }, [])

  if (!resolvedPreference) return null
  if (!showBanner) return null

  return (
    <div className="mx-4 mt-3 mb-0 flex flex-col gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm md:flex-row md:items-center">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <p className="text-xs text-amber-200/90">
          Built with care by <span className="font-semibold text-amber-100">nyk</span> · available for client and custom AI orchestration work.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:ml-auto">
        <a
          href="https://x.com/nyk_builderz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xs font-medium text-amber-100 hover:text-white px-2 py-1 rounded border border-amber-300/30 hover:border-amber-200/50 transition-colors"
        >
          Hire nyk
        </a>
        <a
          href="https://github.com/0xNyk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xs font-medium text-amber-200 hover:text-amber-100 px-2 py-1 rounded border border-amber-500/20 hover:border-amber-400/40 transition-colors"
        >
          Follow nyk
        </a>
        <a
          href="https://dictx.splitlabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xs font-medium text-amber-200 hover:text-amber-100 px-2 py-1 rounded border border-amber-500/20 hover:border-amber-400/40 transition-colors"
        >
          DictX (Upcoming)
        </a>
        <a
          href="https://x.com/nyk_builderz/status/2029007663011643498?s=20"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xs font-medium text-amber-200 hover:text-amber-100 px-2 py-1 rounded border border-amber-500/20 hover:border-amber-400/40 transition-colors"
        >
          Flight Deck Pro (Upcoming)
        </a>
      </div>
    </div>
  )
}
