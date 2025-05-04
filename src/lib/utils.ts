import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Use ES module import for Node.js crypto
let nodeRandomInt: ((min: number, max: number) => number) | undefined
if (typeof window === 'undefined') {
  try {
    // @ts-ignore
    nodeRandomInt = (await import('crypto')).randomInt
  } catch {}
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Secure Random Utilities ---

/**
 * Returns a cryptographically secure random float in [0, 1)
 */
export function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Browser
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] / (0xffffffff + 1)
  } else if (nodeRandomInt) {
    // Node.js
    return nodeRandomInt(0, 0xffffffff) / 0xffffffff
  } else {
    throw new Error('No secure random source available')
  }
}

/**
 * Returns a cryptographically secure random integer in [min, max)
 */
export function secureRandomInt(min: number, max: number): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Browser
    const range = max - min
    if (range <= 0) throw new Error('Invalid range')
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return min + Math.floor((array[0] / (0xffffffff + 1)) * range)
  } else if (nodeRandomInt) {
    // Node.js
    return nodeRandomInt(min, max)
  } else {
    throw new Error('No secure random source available')
  }
}

/**
 * Returns true with the given probability (0 <= probability <= 1)
 */
export function secureRandomChance(probability: number): boolean {
  return secureRandom() < probability
}
