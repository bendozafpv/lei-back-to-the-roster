const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/game.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(mode='arcade',width=390,height=844){
 const elements=new Map(),saved=new Map();
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 function element(id){if(!elements.has(id)){const classes=new Set(['hidden']);elements.set(id,{id,value:id==='duration'?'60':mode,textContent:'',style:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener(){},getContext:()=>ctx});}return elements.get(id);}
 const sandbox={console,Math,URLSearchParams,location:{search:'?qa'},innerWidth:width,innerHeight:height,devicePixelRatio:1,document:{getElementById:element,body:{appendChild(){}},addEventListener(){}},Image:class{complete=false;naturalWidth=0;naturalHeight=0;},performance:{now:()=>0},navigator:{},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},addEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(code,sandbox);element('startBtn').onclick();
 const q=sandbox.__lei;q.set('spawnTimer',1e6);q.set('pickupTimer',1e6);
 return {q,e:element,saved};
}
function step(q,seconds,dt=1/60){for(let t=0;t<seconds;t+=dt)q.step(dt);}
function enemyFixture(q){const o=q.spawn('enemy'),p=q.snapshot().player;o.x=p.x+p.w*.77+24;o.engaged=true;o.phase='windup';o.phaseTimer=.82;o.windup=.82;return o;}
let checks=0;
for(const [w,h] of [[320,568],[390,844],[844,390],[1440,900]])for(const mode of ['training','arcade','hardcore'])for(const dt of [1/60,1/30]){
 const {q}=create(mode,w,h),o=enemyFixture(q);const original=o.hp;
 for(let t=0;t<10&&q.snapshot().running;t+=dt){q.attack();q.step(dt);}
 if(mode==='training')assert.equal(q.snapshot().defeated,1,'Training keeps direct attacks');
 else {assert.equal(q.snapshot().running,false,`${mode}: ground spam must lose`);assert.equal(q.snapshot().hearts,0);assert.equal(q.snapshot().defeated,0);}
 checks++;
 const skilled=create(mode,w,h),sq=skilled.q,se=enemyFixture(sq);
 for(let t=0;t<35&&sq.snapshot().running&&sq.snapshot().defeated===0;t+=dt){const s=sq.snapshot(),e=s.obstacles[0];if(e.phase==='windup'&&e.phaseTimer<=.38&&s.player.onGround)sq.jump();if((!s.rules.guard||e.phase==='recover')&&s.player.onGround)sq.attack();sq.step(dt);}
 assert.equal(sq.snapshot().defeated,1,`${mode} ${w}x${h} dt${dt}: skilled player must win`);
 assert.equal(sq.snapshot().hearts,3,'Timed dodge + counter must avoid all damage');sq.draw();checks++;
 const gateGame=create(mode,w,h),gq=gateGame.q;gq.set('missionElapsed',60);gq.step(dt);assert(gq.snapshot().gate,'Gate spawns after timer');
 for(let t=0;t<60&&gq.snapshot().running;t+=dt){const s=gq.snapshot(),g=s.gate;if(g.docked&&g.phase==='windup'&&g.phaseTimer<=.38&&s.player.onGround)gq.jump();if((!s.rules.guard||g.phase==='recover')&&s.player.onGround)gq.attack();gq.step(dt);}
 assert.equal(gq.snapshot().gate.hp,0,`${mode} ${w}x${h}: Gate can be opened`);assert.equal(gq.snapshot().hearts,3,`${mode} ${w}x${h} dt${dt}: Gate dodge avoids damage`);assert.equal(gateGame.e('ovTitle').textContent,'CASE REOPENED.');gq.draw();checks++;
}
for(const mode of ['training','arcade','hardcore']){
 const {q,e,saved}=create(mode);q.set('hearts',2);q.set('files',q.snapshot().rules.heal-2);let p=q.snapshot().player;
 function collect(){const item=q.pickup();item.x=p.x+p.w*.5;item.y=p.y+p.h*.5;q.step(1/60);}
 collect();assert.equal(q.snapshot().hearts,2);collect();assert.equal(q.snapshot().hearts,3);checks++;
 const before=q.snapshot().missionElapsed;e('pause').onclick();step(q,2);assert.equal(q.snapshot().missionElapsed,before);e('pause').onclick();step(q,1);assert(q.snapshot().missionElapsed>before);checks++;
 q.set('missionElapsed',58);q.step(1/60);const final=q.snapshot().speed;q.set('missionElapsed',0);q.step(1/60);assert(final>q.snapshot().speed);checks++;
 q.set('hearts',1);q.set('inv',0);const blocker=q.spawn('barrier');blocker.x=p.x+p.w*.31;blocker.y=p.y+p.h*.17;q.step(1/60);assert.equal(saved.size,1,'Loss must persist the score');
 assert([...saved.keys()].every(k=>k.startsWith('leiCase008BestV8_'+mode+'_60')));checks++;
}
const {q:gateSpam}=create();gateSpam.set('missionElapsed',60);step(gateSpam,3);for(let t=0;t<15&&gateSpam.snapshot().running;t+=1/60){gateSpam.attack();gateSpam.step(1/60);}assert.equal(gateSpam.snapshot().hearts,0);assert(gateSpam.snapshot().gate.hp>0);checks++;
assert(html.includes('id="difficulty"'));assert(!html.includes('Gegner brauchen zwei Treffer'));
console.log(`PASS: ${checks} gameplay checks across 4 viewport sizes, 3 difficulties and 30/60fps. Spam loses; timed dodges/counters and Gate win without damage; pause/healing/progression verified.`);
