/**
 * Shared entrance animation constants and utilities for galleries (Books, Sketches, Scraps).
 * Provides coordinated values for bottom-to-top rising entrances, quintic easing,
 * image preloading, opacity ramping, and details block synchronization.
 */

export const GALLERY_ENTRANCE = {
  /** Duration per card travel in milliseconds (900 - 1100ms) */
  cardDuration: 1000,
  /** Quick fade duration for prefers-reduced-motion in ms */
  reducedMotionDuration: 200,
  /** Stagger delay in milliseconds per card distance from center (60 - 90ms) */
  staggerMs: 75,
  /** Maximum number of cards away from center to stagger */
  maxStaggerSteps: 6,
  /** Threshold (0.0 to 1.0) of card travel over which opacity ramps from 0 to 1 */
  opacityRampThreshold: 0.4,
  /** Progress (0.0 to 1.0) of overall intro when details block begins fading in */
  detailsThreshold: 0.6,
  /** Starting Y offset multiplier in world units (relative to viewport height) */
  startOffsetYMultiplier: 1.2,
  /** Starting translateY in pixels for mobile DOM cards */
  mobileStartTranslateY: 60,
  /** Fallback timeout for preloading image assets in ms */
  preloadTimeoutMs: 2800,
} as const

/**
 * Quintic ease-out curve: identical to the smooth rising curve in sketches.
 * f(t) = 1 - (1 - t)^5
 */
export function easeOutQuint(t: number): number {
  const clamped = Math.max(0, Math.min(1, t))
  return 1 - Math.pow(1 - clamped, 5)
}

/**
 * Cubic ease-out curve.
 * f(t) = 1 - (1 - t)^3
 */
export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t))
  return 1 - Math.pow(1 - clamped, 3)
}

/**
 * Preloads an array of image URLs and awaits their decode step.
 * Returns a Map of URL -> HTMLImageElement so WebGL textures can be
 * created synchronously with immediate pixel data, avoiding untextured black flashes.
 */
export async function preloadGalleryImages(
  urls: string[],
  timeoutMs = GALLERY_ENTRANCE.preloadTimeoutMs
): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>()
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)))

  if (uniqueUrls.length === 0) {
    return imageMap
  }

  const loaders = uniqueUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => {
        imageMap.set(url, img)
        if (typeof img.decode === 'function') {
          img.decode().then(() => resolve()).catch(() => resolve())
        } else {
          resolve()
        }
      }
      img.onerror = () => {
        imageMap.set(url, img)
        resolve()
      }
      img.src = url
    })
  })

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs)
  })

  await Promise.race([Promise.all(loaders).then(() => {}), timeoutPromise])
  return imageMap
}
