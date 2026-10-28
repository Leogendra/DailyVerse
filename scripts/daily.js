import { dailyIndex } from './date.js';

// ── Render current game into card ──────────────────────
function renderGame(g) {
    document.getElementById('g-name').textContent = g.name;
    document.getElementById('g-cat').textContent = g.category;
    document.getElementById('g-desc').textContent = g.description || '';
    document.getElementById('g-id').textContent = `#${g.id}`;
    document.getElementById('btn-play').dataset.url = g.url;
}

export function initDaily(games) {
    const todayIdx = dailyIndex(games);
    renderGame(games[todayIdx]);

    // Play → new tab
    document.getElementById('btn-play').addEventListener('click', e => {
        window.open(e.currentTarget.dataset.url, '_blank');
    });

    // Surprise me → random game in a new tab (different from today's pick)
    document.getElementById('btn-random').addEventListener('click', () => {
        let idx;
        do { idx = Math.floor(Math.random() * games.length); }
        while (idx === todayIdx);
        window.open(games[idx].url, '_blank');
    });
}
