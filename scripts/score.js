// ── Scoring (configured per game in dailyrush.json, under "score") ──
// pattern: regex whose first group captures the game score (commas are stripped)
// typical -> 0.5, max -> 1, weight: share of the game in the daily score

function parseScore(text, pattern) {
    const match = text.match(new RegExp(pattern, 'm'));
    return match ? Number(match[1].replace(/,/g, '')) : null;
}

// Piecewise linear: 0 -> 0, typical -> 0.5, max -> 1, clamped to [0, 1]
function normalize(score, { typical, max }) {
    const p = score <= typical
        ? 0.5 * score / typical
        : 0.5 + 0.5 * (score - typical) / (max - typical);
    return Math.min(1, Math.max(0, p));
}

// Returns the daily score out of 100, or null while a scored game result is missing or unreadable
export function computeDailyScore(games, results) {
    const scored = games.filter(game => game.score);
    const totalWeight = scored.reduce((sum, game) => sum + game.score.weight, 0);
    if (!totalWeight) return null;

    let total = 0;
    for (const game of scored) {
        const score = results[game.url] ? parseScore(results[game.url], game.score.pattern) : null;
        if (score === null) return null;
        total += normalize(score, game.score) * game.score.weight / totalWeight;
    }
    return Math.round(100 * total);
}
