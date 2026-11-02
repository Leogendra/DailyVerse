// ── Scorers (keyed by game url, as in dailyrush.json) ──
// Each score is mapped to [0, 1] through two anchors: typical -> 0.5, max -> 1
// TODO: calibrate the typical anchors
const SCORERS = {
    'https://latabledessavoirs.fr/': {
        parse: text => matchNumber(text, /\((\d+)\/10\)/),
        typical: 5,
        max: 10,
    },
    'https://krillion.io/': {
        parse: text => matchNumber(text, /^(\d+)$/m),
        typical: 297,
        max: 595,
    },
    'https://chainle.io/': {
        parse: text => matchNumber(text, /·\s*([\d,]+)/),
        typical: 2500,
        max: 5000,
    },
    'https://lessgames.com/moreless': {
        parse: text => matchNumber(text, /(\d+)\/25/),
        typical: 20,
        max: 25,
    },
};

function matchNumber(text, pattern) {
    const match = text.match(pattern);
    return match ? Number(match[1].replace(/,/g, '')) : null;
}

// Piecewise linear: 0 -> 0, typical -> 0.5, max -> 1, clamped to [0, 1]
function normalize(score, { typical, max }) {
    const p = score <= typical
        ? 0.5 * score / typical
        : 0.5 + 0.5 * (score - typical) / (max - typical);
    return Math.min(1, Math.max(0, p));
}

// Returns the daily score out of 100, or null while a game result is missing or unreadable
export function computeDailyScore(results) {
    const entries = Object.entries(SCORERS);
    let total = 0;
    for (const [url, scorer] of entries) {
        const score = results[url] ? scorer.parse(results[url]) : null;
        if (score === null) return null;
        total += normalize(score, scorer) / entries.length;
    }
    return Math.round(100 * total);
}
