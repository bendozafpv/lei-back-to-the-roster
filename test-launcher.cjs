const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
for(const mode of ['training','arcade','hardcore']){
 const elements=new Map(),inner=new Map();let paused=false,starts=0;
 function elem(id){if(!elements.has(id))elements.set(id,{value:id==='difficulty'?mode:'180',style:{},hidden:false,events:{},addEventListener(name,fn){this.events[name]=fn;},setAttribute(){},play:async()=>{},pause(){},focus(){}});return elements.get(id);}
 inner.set('duration',{value:''});inner.set('difficulty',{value:''});inner.set('startBtn',{click(){starts++;}});inner.set('pause',{click(){paused=!paused;}});
 elem('gameFrame').contentDocument={getElementById:id=>inner.get(id)};elem('gameFrame').contentWindow={focus(){}};
 vm.runInNewContext(code,{document:{getElementById:elem,addEventListener(){},hidden:false},location:{search:'?qa'},URLSearchParams});
 elem('gameFrame').events.load();elem('startCase').onclick();assert.equal(starts,1);assert.equal(paused,true,'Game pauses for office intro');assert.equal(inner.get('difficulty').value,mode);assert.equal(inner.get('duration').value,'180');elem('skip').onclick();assert.equal(paused,false);assert.equal(elem('gameFrame').style.visibility,'visible');assert.equal(elem('cinema').hidden,true);elem('skip').onclick();assert.equal(paused,false,'Repeated skip cannot pause game');
}
assert(html.includes('assets/case-intro.mp4?v=office1'));assert(html.includes("game.html?v=8"));console.log('PASS: launcher forwards all modes and duration; office intro pauses game, skip resumes exactly once.');
