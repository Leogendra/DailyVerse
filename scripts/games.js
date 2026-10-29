// ── Render the full games list, sorted alphabetically ───
function renderGameLink(game) {
    const li = document.createElement('li');

    const link = document.createElement('a');
    link.className = 'rush-link';
    link.href = game.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = game.name;

    li.appendChild(link);
    return li;
}

export function initGamesList(games) {
    document.getElementById('games-count').textContent = games.length;

    const sorted = [...games].sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById('games-list').replaceChildren(...sorted.map(renderGameLink));
}
