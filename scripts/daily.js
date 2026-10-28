import { dailyIndex } from './date.js';
import { openWindow } from './window.js';

// ── Render current game into card ──────────────────────
function renderGame(g) {
    document.getElementById('g-name').textContent = g.name;
    document.getElementById('g-cat').textContent = g.category;
    document.getElementById('g-desc').textContent = g.description || '';
    document.getElementById('g-id').textContent = `#${g.id}`;
    document.getElementById('btn-play').dataset.url = g.url;
    document.getElementById('btn-window').dataset.url = g.url;
    document.getElementById('btn-window').dataset.name = g.name;
}

export function initDaily(games) {
    const todayIdx = dailyIndex(games);
    renderGame(games[todayIdx]);

    // Play → new tab
    document.getElementById('btn-play').addEventListener('click', e => {
        window.open(e.currentTarget.dataset.url, '_blank');
    });

    // Window → floating iframe
    document.getElementById('btn-window').addEventListener('click', e => {
        const { url, name } = e.currentTarget.dataset;
        openWindow(url, name);
    });

    // Surprise me → random game (different from today's pick)
    document.getElementById('btn-random').addEventListener('click', () => {
        let idx;
        do { idx = Math.floor(Math.random() * games.length); }
        while (idx === todayIdx);
        const g = games[idx];
        openWindow(g.url, g.name);
    });
}
