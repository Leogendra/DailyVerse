let zTop = 200;
let winSeq = 0;

// ── Floating window ────────────────────────────────────
export function openWindow(url, name) {
    const layer = document.getElementById('win-layer');
    winSeq++;

    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.max(340, Math.min(vw * 0.62, 760));
    const h = Math.max(280, Math.min(vh * 0.72, 580));
    const stagger = ((winSeq - 1) % 6) * 28;
    const left = Math.min(60 + stagger, vw - w - 16);
    const top = Math.min(80 + stagger, vh - h - 16);

    const el = document.createElement('div');
    el.className = 'gwin';
    el.style.cssText = `width:${w}px;height:${h}px;left:${left}px;top:${top}px;z-index:${++zTop}`;

    // Escape name for HTML attribute safety
    const safeName = name.replace(/"/g, '&quot;');

    el.innerHTML = `
        <div class="gwin-bar">
          <span class="dot dot-r" title="Close"></span>
          <span class="dot dot-y"></span>
          <span class="dot dot-g" title="Open in new tab"></span>
          <span class="gwin-title">${safeName}</span>
          <a class="gwin-ext" href="${url}" target="_blank" title="Open in new tab">↗</a>
        </div>
        <iframe src="${url}" title="${safeName}"
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin">
        </iframe>
      `;

    layer.appendChild(el);
    makeDraggable(el);

    el.querySelector('.dot-r').onclick = () => el.remove();
    el.querySelector('.dot-g').onclick = () => window.open(url, '_blank');
    el.addEventListener('mousedown', () => { el.style.zIndex = ++zTop; });
}

// ── Drag ──────────────────────────────────────────────
function makeDraggable(el) {
    const bar = el.querySelector('.gwin-bar');
    bar.addEventListener('mousedown', e => {
        if (e.target.classList.contains('dot') || e.target.tagName === 'A') return;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const ox = e.clientX - rect.left;
        const oy = e.clientY - rect.top;
        const onMove = e => {
            el.style.left = (e.clientX - ox) + 'px';
            el.style.top = (e.clientY - oy) + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}
