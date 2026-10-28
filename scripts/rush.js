import { todayKey } from './date.js';

const STORAGE_PREFIX = 'dailyrush:';

// ── Ticks persistence (one localStorage key per day) ────
function storageKey() {
    return STORAGE_PREFIX + todayKey();
}

function loadDone() {
    try {
        return new Set(JSON.parse(localStorage.getItem(storageKey())) || []);
    } catch {
        return new Set();
    }
}

function saveDone(done) {
    try {
        localStorage.setItem(storageKey(), JSON.stringify([...done]));
    } catch {
        // Storage unavailable (private mode, quota): ticks only live in the DOM
    }
}

function purgePreviousDays() {
    try {
        const current = storageKey();
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith(STORAGE_PREFIX) && key !== current) localStorage.removeItem(key);
        }
    } catch {
        // Storage unavailable: nothing to purge
    }
}

function setDone(url, value) {
    const done = loadDone();
    if (value) done.add(url); else done.delete(url);
    saveDone(done);
    applyState();
}

// ── Render ─────────────────────────────────────────────
const TICK_SVG = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>`;

function renderItem(game) {
    const item = document.createElement('li');
    item.className = 'rush-item';
    item.dataset.url = game.url;

    const tick = document.createElement('button');
    tick.type = 'button';
    tick.className = 'rush-tick';
    tick.setAttribute('aria-label', `Mark ${game.name} as done`);
    tick.innerHTML = TICK_SVG;
    tick.addEventListener('click', () => setDone(game.url, !item.classList.contains('is-done')));

    const link = document.createElement('a');
    link.className = 'rush-link';
    link.href = game.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = game.name;
    link.addEventListener('click', () => setDone(game.url, true));

    item.append(tick, link);
    return item;
}

// Sync ticks, "next" highlight and progress with storage
function applyState() {
    const done = loadDone();
    const items = [...document.querySelectorAll('#rush-list .rush-item')];
    let nextFound = false;

    for (const item of items) {
        const isDone = done.has(item.dataset.url);
        const isNext = !isDone && !nextFound;
        if (isNext) nextFound = true;
        item.classList.toggle('is-done', isDone);
        item.classList.toggle('is-next', isNext);
        item.querySelector('.rush-tick').setAttribute('aria-pressed', String(isDone));
    }

    const count = items.filter(item => item.classList.contains('is-done')).length;
    document.getElementById('rush-progress').textContent = `${count} / ${items.length} done`;
}

export async function initRush() {
    purgePreviousDays();

    let games;
    try {
        const res = await fetch('./dailyrush.json');
        games = await res.json();
    } catch {
        document.getElementById('rush-progress').textContent = 'Could not load Dailyrush list.';
        return;
    }

    document.getElementById('rush-list').replaceChildren(...games.map(renderItem));
    applyState();
}
