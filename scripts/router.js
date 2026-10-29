const RUSH_HASH = '#dailyrush';
const GAMES_HASH = '#games';

// ── Toggle between daily, rush and games-list views from the URL hash ──
function applyRoute() {
    const isRush = location.hash === RUSH_HASH;
    const isGames = location.hash === GAMES_HASH;
    document.getElementById('view-daily').hidden = isRush || isGames;
    document.getElementById('view-rush').hidden = !isRush;
    document.getElementById('view-games').hidden = !isGames;

    const nav = document.getElementById('nav-toggle');
    nav.textContent = isRush ? 'Daily game' : 'Dailyrush';
    nav.href = isRush ? '#' : RUSH_HASH;
}

export function initRouter() {
    window.addEventListener('hashchange', applyRoute);
    applyRoute();
}
