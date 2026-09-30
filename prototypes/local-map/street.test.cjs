const assert = require('node:assert/strict');
const fs = require('node:fs');
const { generate, mount, TYPES } = require('./street.js');
const seed = 'mizuhana-shopping-01';
assert.deepEqual(generate(seed), generate(seed));
assert.notDeepEqual(generate(seed), generate('another-street'));
const fingerprint = require('node:crypto').createHash('sha256').update(JSON.stringify(generate(seed))).digest('hex');
if (process.env.PRINT_FINGERPRINT) console.log(fingerprint);
else assert.equal(fingerprint, '18a1c9e288559f9a186e02538e06e47f1155dab9b178ac302d6156d87e98e98a');
for (let i = 0; i < 1000; i++) {
  const map = generate(`street-${i}`);
  assert(map.buildings.length >= 8 && map.buildings.length <= 12);
  assert.equal(new Set(map.buildings.map(b => b.id)).size, map.buildings.length);
  assert(new Set(map.buildings.map(b => b.type)).size >= 3);
  const bounds = map.buildings.map(b => {
    const theta = b.angle * Math.PI / 180;
    const dx = Math.abs(Math.cos(theta))*(b.w/2+7) + Math.abs(Math.sin(theta))*(b.h/2+7);
    const dy = Math.abs(Math.sin(theta))*(b.w/2+7) + Math.abs(Math.cos(theta))*(b.h/2+7);
    assert(b.x-dx > 0 && b.x+dx < 1000 && b.y-dy > 0 && b.y+dy < 620);
    return { left:b.x-dx, right:b.x+dx, top:b.y-dy, bottom:b.y+dy };
  });
  for (let a=0;a<bounds.length;a++) for(let b=a+1;b<bounds.length;b++) {
    const x=bounds[a],y=bounds[b]; assert(x.right<y.left || y.right<x.left || x.bottom<y.top || y.bottom<x.top, 'lots overlap');
  }
}
// Small DOM double tests the real mount and delegated click/keyboard handlers.
class Element {
  constructor(tag, doc) { this.tag=tag; this.ownerDocument=doc; this.children=[]; this.attrs={}; this.dataset={}; this.style={}; this.events={}; this.textContent=''; }
  setAttribute(k,v) { this.attrs[k]=v; if(k==='data-lot')this.dataset.lot=v; }
  appendChild(el) { el.parent=this; this.children.push(el); return el; }
  append(...els) { els.forEach(el=>this.appendChild(el)); }
  replaceChildren(...els) { this.children=[]; this.append(...els); }
  querySelectorAll() { return this.children.flatMap(el=>[...(el.dataset.lot?[el]:[]),...el.querySelectorAll()]); }
  closest() { return this.dataset.lot ? this : this.parent?.closest(); }
  addEventListener(k,f) { this.events[k]=f; }
  removeEventListener(k) { delete this.events[k]; }
}
const doc={ createElement:tag=>new Element(tag,doc), createElementNS:(_,tag)=>new Element(tag,doc), createTextNode:t=>Object.assign(new Element('#text',doc),{textContent:t}) };
const svg=doc.createElement('svg'), form=doc.createElement('form'), info=doc.createElement('aside'), status=doc.createElement('span'), legend=doc.createElement('ul');
form.elements={seed:{value:seed}};
const container={ownerDocument:doc,querySelector:s=>({'svg':svg,'form':form,'[data-details]':info,'[data-status]':status,'[data-legend]':legend}[s])};
const app=mount(container);
assert.equal(svg.querySelectorAll().length, app.getMap().buildings.length);
assert.equal(legend.children.length, TYPES.length);
let lots=svg.querySelectorAll();
svg.events.click({target:lots[0].children[2]});
assert.equal(lots[0].attrs['aria-pressed'],'true'); assert.match(info.children[0].textContent,/Lot 1/);
let prevented=false;
svg.events.keydown({target:lots[1],key:' ',preventDefault(){prevented=true;}});
assert(prevented); assert.equal(lots[0].attrs['aria-pressed'],'false');assert.equal(lots[1].attrs['aria-pressed'],'true');
form.elements.seed.value='changed'; form.events.submit({preventDefault(){}}); assert.equal(app.getMap().seed,'changed');
form.elements.seed.value=seed; form.events.submit({preventDefault(){}}); assert.deepEqual(app.getMap(),generate(seed));
form.elements.seed.value='<script>alert(1)</script>'; form.events.submit({preventDefault(){}});assert.equal(app.getMap().seed,form.elements.seed.value);
app.generate(seed);
function escapeXML(s) { return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('\"','&quot;'); }
function serialize(el) { if(el.tag==='#text')return el.textContent; return `<${el.tag} ${Object.entries(el.attrs).map(([k,v])=>`${k}="${escapeXML(v)}"`).join(' ')}>${escapeXML(el.textContent)}${el.children.map(serialize).join('')}</${el.tag}>`; }
if(process.env.RENDER_SVG) {
 svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('viewBox','0 0 1000 620');svg.setAttribute('width','1000');svg.setAttribute('height','620');
 const css=fs.readFileSync(__dirname+'/street.css','utf8').split('.ground')[1].split('@media')[0];
 const markup=serialize(svg).replace('>','><style>.ground'+css.replaceAll('var(--mizu-focus)','#975239')+'</style>');
 fs.writeFileSync('/tmp/mizuhana-street.svg',markup);
}
app.destroy(); assert.equal(Object.keys(svg.events).length,0);
console.log('PASS: deterministic generation, 1,000 seeds, bounds/non-overlap, types, click/keyboard selection, regeneration, teardown.');
