const PREFIX = 'iclean:'
const LEGACY_PREFIX = 'ecosocial:'

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw =
        localStorage.getItem(PREFIX + key) ??
        localStorage.getItem(LEGACY_PREFIX + key) ??
        localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      localStorage.removeItem(LEGACY_PREFIX + key)
      localStorage.removeItem(key)
    } catch {
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
    localStorage.removeItem(LEGACY_PREFIX + key)
    localStorage.removeItem(key)
  },

  clearAll(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith(PREFIX) || k.startsWith(LEGACY_PREFIX) || k === 'auth')) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  },
}

