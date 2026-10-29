import { initDaily } from './daily.js';
import { initGamesList } from './games.js';
import { initRouter } from './router.js';
import { initRush } from './rush.js';

// ── Boot ──────────────────────────────────────────────
(async () => {
    // Format date next to the daily kicker
    document.getElementById('daily-date').textContent =
        new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

    initRouter();
    initRush();

    let games;
    try {
        const res = await fetch('./daily_list.json');
        games = await res.json();
    } catch {
        document.getElementById('loading').textContent = 'Could not load game list.';
        return;
    }

    initDaily(games);
    initGamesList(games);

    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('footer').style.display = 'block';
})();
