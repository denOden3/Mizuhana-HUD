/* Mizuhana local street POC v1. Plain JS, no storage, no HUD hooks. */
(function (root) {
  'use strict';
  const TYPES = Object.freeze([
    { id: 'cafe', name: 'Tea & Coffee', note: 'A quiet counter, warm cups, and a seat by the window.', roof: '#955b48', shape: 'gable' },
    { id: 'grocer', name: 'Corner Grocer', note: 'Seasonal produce and everyday provisions.', roof: '#44694f', shape: 'awning' },
    { id: 'bakery', name: 'Street Bakery', note: 'Fresh bread and a small display of sweets.', roof: '#a4763c', shape: 'awning' },
    { id: 'boutique', name: 'Little Boutique', note: 'Clothes, accessories, and locally made gifts.', roof: '#765971', shape: 'gable' },
    { id: 'workshop', name: 'Craft Workshop', note: 'Handmade goods and a well-used workbench.', roof: '#526a78', shape: 'flat' }
  ]);
  function randomFor(seed) {
    let h = 2166136261;
    for (const c of seed) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return function () { h += 0x6D2B79F5; let t = Math.imul(h ^ h >>> 15, h | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const round = n => Math.round(n * 100) / 100;
  function generate(seed = 'mizuhana-shopping-01') {
    seed = String(seed);
    const rand = randomFor(seed);
    const amplitude = 20 + rand() * 20, phase = rand() * Math.PI * 2;
    const yAt = x => 310 + Math.sin((x - 100) / 800 * Math.PI * 1.5 + phase) * amplitude;
    const slopeAt = x => Math.cos((x - 100) / 800 * Math.PI * 1.5 + phase) * amplitude * Math.PI * 1.5 / 800;
    const road = Array.from({ length: 49 }, (_, i) => { const x = 30 + i * 940 / 48; return { x: round(x), y: round(yAt(x)) }; });
    const count = 8 + Math.floor(rand() * 5), buildings = [], trees = [];
    // Each side gets disjoint 150px slots. Width, angle and depth bounds preserve separation.
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1, slot = Math.floor(i / 2);
      const sideCount = side === -1 ? Math.ceil(count / 2) : Math.floor(count / 2);
      const x = 125 + slot * (750 / (sideCount - 1)) + (rand() - .5) * 14;
      const w = 79 + rand() * 21, h = 58 + rand() * 18;
      const y = yAt(x) + side * (79 + h / 2);
      const type = TYPES[(slot + (side === 1 ? 2 : 0) + Math.floor(rand() * 2)) % TYPES.length];
      buildings.push({ id: `lot-${i + 1}`, lot: i + 1, type: type.id, x: round(x), y: round(y), w: round(w), h: round(h), angle: round(Math.atan(slopeAt(x)) * 180 / Math.PI), side });
      trees.push({ x: round(x + 58), y: round(yAt(x + 58) + side * 59), r: round(9 + rand() * 5) });
      trees.push({ x: round(x - 35 + rand() * 60), y: round(y + side * (h / 2 + 39)), r: round(13 + rand() * 6) });
    }
    return { version: 1, seed, width: 1000, height: 620, road, buildings, trees };
  }
  function details(building) {
    const type = TYPES.find(t => t.id === building.type);
    return { title: `${type.name} · Lot ${building.lot}`, description: type.note, address: `Shopping Street, lot ${building.lot}`, status: 'Placeholder · hours, stock, and residents are not simulated.' };
  }
  function mount(container) {
    const doc = container.ownerDocument, svg = container.querySelector('svg'), form = container.querySelector('form'), input = form.elements.seed;
    const info = container.querySelector('[data-details]'), status = container.querySelector('[data-status]');
    let map, selected;
    const ns = 'http://www.w3.org/2000/svg';
    function node(name, attrs, parent, value) {
      const el = doc.createElementNS(ns, name);
      for (const [key, val] of Object.entries(attrs || {})) el.setAttribute(key, String(val));
      if (value !== undefined) el.textContent = value;
      if (parent) parent.appendChild(el);
      return el;
    }
    function select(id) {
      const b = map.buildings.find(b => b.id === id); if (!b) return;
      selected = id;
      for (const el of svg.querySelectorAll('[data-lot]')) el.setAttribute('aria-pressed', String(el.dataset.lot === id));
      const d = details(b); info.replaceChildren();
      for (const [tag, value] of [['h2', d.title], ['p', d.description], ['p', d.address], ['small', d.status]]) {
        const el = doc.createElement(tag); el.textContent = value; info.appendChild(el);
      }
    }
    function draw(seed) {
      map = generate(seed); selected = null; svg.replaceChildren();
      node('title', { id: 'street-title' }, svg, 'Mizuhana shopping street prototype');
      node('desc', {}, svg, 'A curved road with shop lots on both sides. Tab to a building and press Enter or Space for details.');
      node('rect', { width: 1000, height: 620, rx: 22, class: 'ground' }, svg);
      const d = map.road.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      node('path', { d, class: 'sidewalk' }, svg);
      node('path', { d, class: 'road' }, svg);
      node('path', { d, class: 'road-center' }, svg);
      const greenery = node('g', { 'aria-hidden': 'true' }, svg);
      for (const t of map.trees) {
        node('circle', { cx: t.x + 3, cy: t.y + 4, r: t.r, class: 'tree-shadow' }, greenery);
        node('circle', { cx: t.x, cy: t.y, r: t.r, class: 'tree' }, greenery);
        node('circle', { cx: t.x - 3, cy: t.y - 3, r: t.r * .55, class: 'tree-light' }, greenery);
      }
      for (const b of map.buildings) {
        const type = TYPES.find(t => t.id === b.type);
        const g = node('g', { transform: `translate(${b.x} ${b.y}) rotate(${b.angle})`, role: 'button', tabindex: 0, 'aria-label': details(b).title, 'aria-pressed': 'false', 'data-lot': b.id, class: 'building' }, svg);
        node('rect', { x: -b.w/2 - 7, y: -b.h/2 - 7, width: b.w+14, height: b.h+14, rx: 5, class: 'lot' }, g);
        node('rect', { x: -b.w/2+3, y: -b.h/2+5, width: b.w, height: b.h, rx: 3, class: 'building-shadow' }, g);
        node('rect', { x: -b.w/2, y: -b.h/2, width: b.w, height: b.h, rx: 3, fill: type.roof, class: 'footprint' }, g);
        if (type.shape === 'gable') node('path', { d: `M${-b.w/2+5} 0H${b.w/2-5}`, class: 'roof-ridge' }, g);
        if (type.shape === 'flat') node('rect', { x: -b.w/2+10, y: -b.h/2+10, width: b.w-20, height: b.h-20, class: 'roof-inset' }, g);
        const front = -b.side * (b.h/2 - 5);
        if (type.shape === 'awning') {
          node('rect', { x: -b.w/2+5, y: front-4, width: b.w-10, height: 8, class: 'awning' }, g);
          for (let x = -b.w/2+9; x < b.w/2-5; x += 14) node('path', { d: `M${x} ${front-4}v8`, class: 'awning-stripe' }, g);
        }
        node('rect', { x: -6, y: front-3, width: 12, height: 6, class: 'door' }, g);
        node('rect', { x: -19, y: -14, width: 38, height: 28, rx: 5, class: 'number-plate' }, g);
        node('text', { x: 0, y: 5, 'text-anchor': 'middle', class: 'lot-number' }, g, b.lot);
      }
      status.textContent = `${map.buildings.length} lots · fixed seed · generator v1`;
      info.replaceChildren(); const hint = doc.createElement('p'); hint.textContent = 'Select a building to inspect its placeholder details.'; info.appendChild(hint);
      const legend = container.querySelector('[data-legend]'); legend.replaceChildren();
      for (const t of TYPES) { const li = doc.createElement('li'), swatch = doc.createElement('span'); swatch.style.background = t.roof; swatch.className = 'swatch'; swatch.setAttribute('aria-hidden', 'true'); li.append(swatch, doc.createTextNode(t.name)); legend.appendChild(li); }
    }
    const click = e => { const g = e.target.closest('[data-lot]'); if (g) select(g.dataset.lot); };
    const key = e => { if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('[data-lot]'); if (g) { e.preventDefault(); select(g.dataset.lot); } } };
    const submit = e => { e.preventDefault(); draw(input.value); };
    svg.addEventListener('click', click); svg.addEventListener('keydown', key); form.addEventListener('submit', submit);
    draw(input.value);
    return { generate: draw, select, getMap: () => map, destroy() { svg.removeEventListener('click', click); svg.removeEventListener('keydown', key); form.removeEventListener('submit', submit); } };
  }
  const api = { generate, details, mount, TYPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.MizuhanaStreet = api; const el = document.querySelector('[data-mizu-street]'); if (el) mount(el); }
})(typeof globalThis !== 'undefined' ? globalThis : this);
