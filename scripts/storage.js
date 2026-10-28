import { todayKey } from './date.js';

// ── Per-day localStorage keys ──────────────────────────
export function dailyStorageKey(prefix) {
    return prefix + todayKey();
}

export function purgePreviousDays(prefix) {
    try {
        const current = dailyStorageKey(prefix);
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix) && key !== current) localStorage.removeItem(key);
        }
    } catch {
        // Storage unavailable: nothing to purge
    }
}
