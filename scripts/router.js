const RUSH_HASH = '#dailyrush';

// ── Toggle between daily and rush views from the URL hash ──
function applyRoute() {
    const isRush = location.hash === RUSH_HASH;
    document.getElementById('view-daily').hidden = isRush;
    document.getElementById('view-rush').hidden = !isRush;

    const nav = document.getElementById('nav-toggle');
    nav.textContent = isRush ? 'Daily game' : 'Dailyrush';
    nav.href = isRush ? '#' : RUSH_HASH;
}

export function initRouter() {
    window.addEventListener('hashchange', applyRoute);
    applyRoute();
}
