import { dailyStorageKey, purgePreviousDays } from './storage.js';

const STORAGE_PREFIX = 'dailyrush-results:';
const SEPARATOR = '___';
const CLEAN_DELAY_MS = 1000;
const FEEDBACK_DELAY_MS = 1500;
const URL_PATTERN = /https?:\/\/|www\./i;

// ── Persistence (one localStorage key per day) ─────────
function loadResults() {
    try {
        return localStorage.getItem(dailyStorageKey(STORAGE_PREFIX)) || '';
    } catch {
        return '';
    }
}

function saveResults(text) {
    try {
        localStorage.setItem(dailyStorageKey(STORAGE_PREFIX), text);
    } catch {
        // Storage unavailable (private mode, quota): results only live in the textarea
    }
}

// ── Cleaning ───────────────────────────────────────────
// Split on separator lines, drop blank lines and lines holding a URL or a game hostname
function parseBlocks(text, hosts) {
    const blocks = [[]];
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (line === SEPARATOR) {
            blocks.push([]);
        } else if (line && !URL_PATTERN.test(line) && !hosts.some(host => line.toLowerCase().includes(host))) {
            blocks.at(-1).push(line);
        }
    }
    return blocks.filter(block => block.length).map(block => block.join('\n'));
}

function joinBlocks(blocks) {
    return blocks.join(`\n${SEPARATOR}\n`);
}

// Trailing separator leaves the caret on an empty line, ready for the next paste
function formatForInput(blocks) {
    return blocks.length ? `${joinBlocks(blocks)}\n${SEPARATOR}\n` : '';
}

function gameHosts(games) {
    return games.map(game => new URL(game.url).hostname.replace(/^www\./, '').toLowerCase());
}

// ── Wiring ─────────────────────────────────────────────
export function initResults(games) {
    purgePreviousDays(STORAGE_PREFIX);

    const input = document.getElementById('rush-results');
    const copyButton = document.getElementById('btn-copy-results');
    const copyLabel = copyButton.textContent;
    const hosts = gameHosts(games);
    let cleanTimer;
    let feedbackTimer;

    function clean() {
        clearTimeout(cleanTimer);
        const blocks = parseBlocks(input.value, hosts);
        input.value = formatForInput(blocks);
        input.setSelectionRange(input.value.length, input.value.length);
        saveResults(input.value);
        return blocks;
    }

    function showFeedback(label) {
        clearTimeout(feedbackTimer);
        copyButton.textContent = label;
        feedbackTimer = setTimeout(() => { copyButton.textContent = copyLabel; }, FEEDBACK_DELAY_MS);
    }

    input.value = loadResults();
    input.addEventListener('input', () => saveResults(input.value));
    input.addEventListener('paste', () => {
        clearTimeout(cleanTimer);
        cleanTimer = setTimeout(clean, CLEAN_DELAY_MS);
    });

    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(joinBlocks(clean()));
            showFeedback('Copied');
        } catch {
            showFeedback('Copy failed');
        }
    });
}
