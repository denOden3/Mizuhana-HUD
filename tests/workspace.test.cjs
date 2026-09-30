const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const source = fs.readFileSync(__dirname + '/../mizuhana-testing.user.js', 'utf8');
const boundary = source.lastIndexOf('    /* =========================================================', source.indexOf('       CHAT IDENTIFICATION'));
const utilities = source.slice(source.indexOf('    function escapeHTML('), source.indexOf('    const STATE_OPEN'));
const prefix = source.slice(0, boundary) + utilities + `
globalThis.api = { get state(){return state}, defaults: DEFAULT_STATE, normalizeWorkspace, migrateWorkspaceState,
loadState, loadSaveSlot, saveState, saveToSlot, captureGameplayState, routeBetween, applyWorkspaceNarratorState,
workspaceMapHTML, workspaceSidebarHTML, expandedWorkspaceHTML, attachWorkspaceListeners,
get expanded(){return workspaceExpanded}, set expanded(v){workspaceExpanded=v}, get scroll(){return workspaceScroll},
rememberWorkspaceScroll, restoreWorkspaceScroll, closeWorkspacePanel, openWorkspacePanel, nodeLabel };
})();`;
let persisted = new Map(), rendered = 0, inserted = [];
const stable = { characterName: 'Axel', titleScreen: false, activePage: 'home', cash: 400,
    tasks: [{ name: 'Swim', time: '6 PM', icon: '🌊' }], scene: 'A quiet afternoon.',
    location: 'Harbor', newGameRegion: 'nagihama', activeSaveId: 'axel',
    map: [{ name: 'Harbor', current: true, discovered: true }, { name: 'Secret cave', discovered: false }],
    saveSlots: [{ id: 'axel', name: 'Axel', data: { characterName: 'Axel', location: 'Harbor', cash: 400 } },
        { id: 'ren', name: 'Ren', data: { characterName: 'Ren', location: 'Library', cash: 800 } }] };
persisted.set('mizuhana-hud-v01', structuredClone(stable));
const controls = [], forms = [], checkboxes = [];
const story = { scrollTop: 87 }, main = { scrollTop: 24 }, dock = { scrollTop: 41 }, feedback = { textContent: '' };
const hud = { dataset: { workspacePage: 'home' }, querySelectorAll(selector) {
    if (selector === '[data-ws-action]') return controls;
    if (selector === '[data-ws-form]') return forms;
    if (selector.includes('[data-check-index]')) return checkboxes;
    return [];
}, querySelector(selector) {
    return ({ '.mizu-scene-text': story, '#mizu-main': main, '.mizu-panel-dock': dock, '.mizu-map-details .mizu-ws-feedback': feedback })[selector] || null;
}, addEventListener() {} };
class TestFormData {
    constructor(form){this.data=form.data;}
    get(k){return this.data[k] ?? '';}
    getAll(k){return Array.isArray(this.data[k])?this.data[k]:this.data[k]===undefined?[]:[this.data[k]];}
    has(k){return this.data[k]!==undefined;}
}
const context = { structuredClone, Date, Math, JSON, Set, Map, console,
    GM_getValue: (key, fallback) => persisted.has(key) ? structuredClone(persisted.get(key)) : fallback,
    GM_setValue: (key, value) => persisted.set(key, structuredClone(value)),
    confirm:()=>true, determineLayout:()=> 'desktop', renderHUD:()=>rendered++, FormData:TestFormData,
    insertIntoComposer: text=>{inserted.push(text);return true},
    document: { activeElement:null, querySelector:selector=>selector==='#mizuhana-hud'?hud:selector==='#mizu-expanded-heading'?{focus(){}}:selector.includes('feedback')?feedback:null, querySelectorAll:()=>[], getElementById:()=>null }
};
vm.createContext(context); vm.runInContext(prefix, context);
const a = context.api;
assert.deepEqual(persisted.get('mizuhana-hud-v01'), stable, 'stable storage must stay untouched');
assert.equal(a.state.workspaceVersion, 1);
assert.equal(a.state.saveSlots[1].data.memo.note, '');
assert.equal(a.state.worldMap.nodes.find(n=>n.name==='Secret cave').known, 0);
const world = JSON.stringify(a.state.worldMap);
a.normalizeWorkspace(a.state); a.normalizeWorkspace(a.state);
assert.equal(JSON.stringify(a.state.worldMap), world, 'reopening must not reroll local nodes or duplicate canon');
assert.equal(a.state.worldMap.nodes.filter(n=>n.id==='nagihama-town').length, 1);
a.state.memo.note = 'Axel’s memo'; a.state.pets = [{id:'mochi',name:'Mochi',species:'Rabbit',mood:'Calm',bond:15}]; a.saveState();
assert(a.loadSaveSlot('ren')); assert.equal(a.state.memo.note, ''); assert.equal(a.state.pets.length, 0, 'no companion leaks between saves');
assert(a.loadSaveSlot('axel')); assert.equal(a.state.memo.note, 'Axel’s memo'); assert.equal(a.state.pets[0].name, 'Mochi');
const bond = a.state.pets[0].bond; assert.equal(a.loadState().pets[0].bond, bond, 'no absence decay');
a.state.worldMap.view='local'; a.state.worldMap.selection='legacy-1';
const html = a.workspaceMapHTML(); assert(!html.includes('Secret cave'), 'unknown map detail, title and marker must stay hidden');
assert(html.includes('???'));
a.state.worldMap.nodes.find(n=>n.id==='legacy-1').known=2;
assert.deepEqual(Array.from(a.routeBetween('legacy-0','legacy-1')), ['route-legacy-1']);
a.state.worldMap.routes.find(r=>r.id==='route-legacy-1').closed=true;
assert.equal(a.routeBetween('legacy-0','legacy-1'), null, 'closed routes must not be planned');
a.state.worldMap.routes.find(r=>r.id==='route-legacy-1').closed=false;
assert(a.applyWorkspaceNarratorState({ worldMap:{nodes:[{id:'story-shop',name:'First café',region:'nagihama',known:3,x:.3,y:.4}]},weather:{condition:'Rain',region:'Nagihama'},inventory:[{name:'Rod',quantity:1,price:200}]}));
assert(a.applyWorkspaceNarratorState({ worldMap:{nodes:[{id:'story-shop',condition:'Closed for today',closed:true}]}}));
assert.equal(a.state.worldMap.nodes.find(n=>n.id==='story-shop').name,'First café','partial updates preserve established local identity');
assert.equal(a.state.inventory[0].price,200);
assert(a.applyWorkspaceNarratorState({worldMap:{nodes:[{id:'nagihama-town',name:'Wrong name',x:.9}],current:'story-shop'}}));
assert.equal(a.state.worldMap.nodes.find(n=>n.id==='nagihama-town').name,'Nagihama Town','canonical anchors cannot be renamed');
assert.equal(a.state.location,'First café','explicit current node updates location');
assert.equal(a.state.worldMap.current,'story-shop');
a.state.worldMap.current='legacy-0';
assert.doesNotThrow(()=>a.normalizeWorkspace({...a.state, pets:[null],inventory:[null],relationships:[null],memo:{checklist:[null]},shoppingTargets:[null]}));
function control(dataset){const c={dataset, addEventListener:(event,fn)=>c[event]=fn};controls.push(c);return c;}
function form(type,data){const f={dataset:{wsForm:type},data,addEventListener:(event,fn)=>f[event]=fn};forms.push(f);return f;}
const jump=control({wsAction:'panel-jump',panel:'memo'}), petAction=control({wsAction:'pet-action',value:'Offer food'}), go=control({wsAction:'map-go',node:'legacy-1'});
const memo=form('memo',{note:'Saved notes',checklist:'[x] Bought bait\n[ ] Water plants'});
const shopping=form('shopping',{name:'Rod',price:''});
const petNew=control({wsAction:'pet-new'});
a.attachWorkspaceListeners(hud);
const beforePanels=Array.from(a.state.hudWorkspace.panels);jump.click();
assert(beforePanels.every(p=>a.state.hudWorkspace.panels.includes(p)));assert(a.state.hudWorkspace.panels.includes('memo'));
memo.submit({preventDefault(){}});assert.equal(a.state.memo.note,'Saved notes');assert.equal(a.state.memo.checklist[0].done,true);
shopping.submit({preventDefault(){}});assert.equal(a.state.shoppingTargets[0].price,200,'target can use actual item price');
petAction.click();assert(inserted.at(-1).includes('Mochi'));assert.equal(a.state.pets[0].bond,bond,'actions wait for narration');
const time=a.state.time, location=a.state.location;go.click();assert(inserted.at(-1).includes('Secret cave'));assert.equal(a.state.time,time);assert.equal(a.state.location,location,'map click/travel request must not silently move');
petNew.click();a.expanded='pet';assert(a.expandedWorkspaceHTML().includes('value=""'),'new pet form must be blank');
a.expanded=null;hud.dataset.workspacePage=a.state.activePage;a.rememberWorkspaceScroll();a.openWorkspacePanel('memo');a.closeWorkspacePanel();assert.equal(a.scroll.home.story,87);story.scrollTop=0;main.scrollTop=0;a.restoreWorkspaceScroll(hud);assert.equal(story.scrollTop,87);assert.equal(main.scrollTop,24);
for(const id of ['tracker','dock','memo','shopping','tasks','look','pet','inventory','relationships','weather','map-editor']){a.expanded=id;const markup=a.expandedWorkspaceHTML();assert(markup.includes('Close'));if(process.env.MIZUHANA_QA_HTML) fs.writeFileSync(__dirname+'/qa-'+id+'.html',markup);}
a.expanded=null;if(process.env.MIZUHANA_QA_HTML) {fs.writeFileSync(__dirname+'/qa-home.html',a.workspaceSidebarHTML(false));fs.writeFileSync(__dirname+'/qa-map.html',a.workspaceMapHTML());}
const base=fs.readFileSync(__dirname+'/../mizuhana.user.js','utf8');
const destinationBlock=s=>s.slice(s.indexOf('        /* ---------- Mobile title / destination containment ---------- */'),s.indexOf('        /* The manager and Settings scroll inside'));
assert.equal(destinationBlock(source),destinationBlock(base),'mobile Destination containment stays exact');
assert(source.includes('mizuhana-hud-workspace-v1'));assert(source.includes('mizu-major-tabs'));
assert(source.includes("hud.style.setProperty('height', `${maxHeight}px`, 'important')"),'composer bounds override theme/legacy size rules');
const safeSource=source.slice(source.indexOf('    function updateMobileComposerSafeZone('),source.indexOf('    let resizeTimer'));
let composerTop=250;
const properties={};
const safeHud={contains:()=>false,getBoundingClientRect:()=>({top:6}),style:{setProperty:(k,v)=>properties[k]=v}};
const safeContext={window:{innerHeight:600},state:{displayMode:'compact'},determineLayout:()=> 'mobile',document:{querySelector:()=>({getBoundingClientRect:()=>({top:composerTop,bottom:600,width:350,height:350})})}};
vm.createContext(safeContext);vm.runInContext(safeSource+'globalThis.run=updateMobileComposerSafeZone;',safeContext);
safeContext.run(safeHud);assert(Number.parseInt(properties.height)+6<=composerTop-14,'HUD must stop before the composer with keyboard open');
composerTop=100;safeContext.run(safeHud);assert(Number.parseInt(properties.height)+6<=86,'small viewports must not force a 330px HUD over the composer');
console.log('PASS: migration, stable isolation, save-slot separation, permanent local geography, knowledge masking, closures, narrator patches, panel dock, notes, shopping, pet requests, map requests, workspace restoration and editor rendering.');
