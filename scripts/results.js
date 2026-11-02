import { dailyStorageKey, purgePreviousDays } from './storage.js';

const STORAGE_PREFIX = 'dailyrush-results:';
const SEPARATOR = '___';
const FEEDBACK_DELAY_MS = 1500;
const MIN_OUTPUT_ROWS = 3;
const URL_PATTERN = /https?:\/\/|www\./i;

const CLIPBOARD_SVG = `
    <svg class="icon-paste" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>`;

const CHECK_SVG = `
    <svg class="icon-pasted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>`;

const CLEAR_SVG = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>`;

// ── Persistence (one localStorage key per day, results keyed by game url) ──
function loadResults() {
    try {
        return JSON.parse(localStorage.getItem(dailyStorageKey(STORAGE_PREFIX))) || {};
    } catch {
        // Storage unavailable, or today's value is still in the former plain text format
        return {};
    }
}

function saveResults(results) {
    try {
        localStorage.setItem(dailyStorageKey(STORAGE_PREFIX), JSON.stringify(results));
    } catch {
        // Storage unavailable (private mode, quota): results only live in memory
    }
}

// ── Cleaning ───────────────────────────────────────────
// Drop blank lines and lines holding a URL or a game hostname
function cleanResult(text, hosts) {
    return text.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !URL_PATTERN.test(line) && !hosts.some(host => line.toLowerCase().includes(host)))
        .join('\n');
}

function gameHosts(games) {
    return games.map(game => new URL(game.url).hostname.replace(/^www\./, '').toLowerCase());
}

// ── Render ─────────────────────────────────────────────
function renderButton(className, svg) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.innerHTML = svg;
    return button;
}

// ── Wiring ─────────────────────────────────────────────
// Adds a paste button to each rendered rush item and keeps the read-only total in sync
export function initResults(games, onPaste) {
    purgePreviousDays(STORAGE_PREFIX);

    const output = document.getElementById('rush-results');
    const copyButton = document.getElementById('btn-copy-results');
    const copyLabel = copyButton.textContent;
    const items = [...document.querySelectorAll('#rush-list .rush-item')];
    const hosts = gameHosts(games);
    const results = loadResults();
    let feedbackTimer;

    function render() {
        output.value = games
            .map(game => results[game.url])
            .filter(Boolean)
            .join(`\n${SEPARATOR}\n`);
        output.rows = Math.max(MIN_OUTPUT_ROWS, output.value.split('\n').length);

        for (const item of items) {
            const hasResult = item.dataset.url in results;
            const name = item.querySelector('.rush-link').textContent;
            item.classList.toggle('has-result', hasResult);
            item.querySelector('.rush-paste').setAttribute('aria-label',
                hasResult ? `Replace ${name} result` : `Paste ${name} result`);
        }
    }

    function commit() {
        saveResults(results);
        render();
    }

    // Returns false when nothing is left after cleaning
    function setResult(url, text) {
        const result = cleanResult(text, hosts);
        if (!result) return false;
        results[url] = result;
        commit();
        onPaste(url);
        return true;
    }

    function clearResult(url) {
        delete results[url];
        commit();
    }

    function attachControls(item) {
        const url = item.dataset.url;
        const name = item.querySelector('.rush-link').textContent;

        const paste = renderButton('rush-paste', CLIPBOARD_SVG + CHECK_SVG);
        const clear = renderButton('rush-clear', CLEAR_SVG);
        clear.setAttribute('aria-label', `Clear ${name} result`);

        // Manual paste target, shown only when the Clipboard API is unavailable or denied
        const fallback = document.createElement('textarea');
        fallback.className = 'rush-paste-fallback';
        fallback.rows = 2;
        fallback.spellcheck = false;
        fallback.placeholder = `Paste ${name} result here`;
        fallback.hidden = true;

        function closeFallback() {
            fallback.value = '';
            fallback.hidden = true;
        }

        paste.addEventListener('click', async () => {
            try {
                if (setResult(url, await navigator.clipboard.readText())) return;
            } catch {
                // No Clipboard API (insecure context, old browser) or permission denied
            }
            fallback.hidden = false;
            fallback.focus();
        });

        clear.addEventListener('click', () => clearResult(url));

        fallback.addEventListener('paste', event => {
            event.preventDefault();
            if (setResult(url, event.clipboardData.getData('text/plain'))) closeFallback();
        });
        fallback.addEventListener('blur', () => {
            if (fallback.value) setResult(url, fallback.value);
            closeFallback();
        });

        const controls = document.createElement('div');
        controls.className = 'rush-result';
        controls.append(paste, clear);
        item.append(controls, fallback);
    }

    function showFeedback(label) {
        clearTimeout(feedbackTimer);
        copyButton.textContent = label;
        feedbackTimer = setTimeout(() => { copyButton.textContent = copyLabel; }, FEEDBACK_DELAY_MS);
    }

    items.forEach(attachControls);
    render();

    copyButton.addEventListener('click', async () => {
        if (!output.value) {
            showFeedback('Nothing to copy');
            return;
        }
        try {
            await navigator.clipboard.writeText(output.value);
            showFeedback('Copied');
        } catch {
            showFeedback('Copy failed');
        }
    });
}
