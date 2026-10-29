// ── Render the full games list, sorted alphabetically ───
function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function renderGameLink(game) {

    const li = document.createElement('li');
    li.dataset.normalized = normalize(game.name);

    const link = document.createElement('a');
    link.className = 'rush-link';
    link.href = game.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = game.name;

    li.appendChild(link);
    return li;
}

// Show only games whose normalized name contains the normalized query
function filterGames(query) {
    const needle = normalize(query);
    for (const li of document.querySelectorAll('#games-list li')) {
        li.hidden = !li.dataset.normalized.includes(needle);
    }

    // update the count of visible games
    const visibleCount = document.querySelectorAll('#games-list li:not([hidden])').length;
    document.getElementById('all-game-label').textContent = `All games (${visibleCount})`;
}

export function initGamesList(games) {
    // set the number of games
    document.getElementById('all-game-label').textContent = `All games (${games.length})`;
    document.getElementById('games-count').textContent = games.length;

    const sorted = [...games].sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById('games-list').replaceChildren(...sorted.map(renderGameLink));

    document.getElementById('games-search').addEventListener('input', e => filterGames(e.target.value));
}
