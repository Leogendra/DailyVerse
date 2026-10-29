import { dailyIndex } from './date.js';

// ── Render current game into card ──────────────────────
function renderGame(g) {
    document.getElementById('g-name').textContent = g.name;
    document.getElementById('g-cat').textContent = g.category;
    document.getElementById('g-desc').textContent = g.description || '';
    document.getElementById('g-id').textContent = `#${g.id}`;
    document.getElementById('btn-play').dataset.url = g.url;
}

function randomGameUrl(games, excludeIdx) {
    let idx;
    do { idx = Math.floor(Math.random() * games.length); }
    while (idx === excludeIdx);
    return games[idx].url;
}

export function initDaily(games) {
    const todayIdx = dailyIndex(games);
    renderGame(games[todayIdx]);

    // Play → new tab
    document.getElementById('btn-play').addEventListener('click', e => {
        window.open(e.currentTarget.dataset.url, '_blank');
    });

    // Surprise me → real link, so middle-click opens several in a row in new tabs.
    // href is re-rolled on mousedown, before the browser reads it to open the tab.
    const btnRandom = document.getElementById('btn-random');
    btnRandom.addEventListener('mousedown', () => {
        btnRandom.href = randomGameUrl(games, todayIdx);
    });
}
