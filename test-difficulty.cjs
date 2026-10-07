const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/game.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(mode='arcade',width=390,height=844){
 const elements=new Map(),saved=new Map(),keys={},drawCalls=[];let imageId=0;
 const ctx=new Proxy({drawImage:(image,...args)=>drawCalls.push({id:image.id,args}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 function element(id){if(!elements.has(id)){const classes=new Set(['hidden']);elements.set(id,{id,value:id==='duration'?'60':mode,textContent:'',style:{},dataset:{},events:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener(name,fn){this.events[name]=fn;},getContext:()=>ctx});}return elements.get(id);}
 const sandbox={console,Math,URLSearchParams,location:{search:'?qa'},innerWidth:width,innerHeight:height,devicePixelRatio:1,document:{getElementById:element,body:{appendChild(){}},addEventListener(){}},Image:class{id=imageId++;complete=true;naturalWidth=1536;naturalHeight=1536;},performance:{now:()=>0},navigator:{},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},addEventListener(name,fn){keys[name]=fn;},requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(code,sandbox);element('startBtn').onclick();
 const q=sandbox.__lei;q.set('spawnTimer',1e6);q.set('pickupTimer',1e6);
 return {q,e:element,saved,keys,drawCalls};
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
 assert([...saved.keys()].every(k=>k.startsWith('leiCase008BestV9_'+mode+'_60')));checks++;
}
const {q:gateSpam}=create();gateSpam.set('missionElapsed',60);step(gateSpam,3);for(let t=0;t<15&&gateSpam.snapshot().running;t+=1/60){gateSpam.attack();gateSpam.step(1/60);}assert.equal(gateSpam.snapshot().hearts,0);assert(gateSpam.snapshot().gate.hp>0);checks++;
for(const [w,h] of [[320,568],[390,844],[844,390],[1440,900]])for(const mode of ['training','arcade','hardcore'])for(const dt of [1/60,1/30]){
 const {q}=create(mode,w,h),enemy=enemyFixture(q);
 for(let t=0;t<35&&q.snapshot().running&&q.snapshot().defeated===0;t+=dt){const s=q.snapshot(),e=s.obstacles[0];if(e.phase==='windup'&&e.phaseTimer<=.12)q.dodge();if(e.phase==='recover'&&e.phaseTimer<s.rules.recover-.3)q.attack();q.step(dt);}
 assert.equal(q.snapshot().defeated,1,`${mode} ${w}x${h}: dodge + counter must win`);assert.equal(q.snapshot().hearts,3,'Dodge counter avoids damage without jumping');q.draw();checks++;
 const {q:gq}=create(mode,w,h);gq.set('missionElapsed',60);gq.step(dt);
 for(let t=0;t<60&&gq.snapshot().running;t+=dt){const s=gq.snapshot(),g=s.gate;if(g.docked&&g.phase==='windup'&&g.phaseTimer<=.12)gq.dodge();if((!s.rules.guard||g.phase==='recover'&&g.phaseTimer<s.rules.recover-.3))gq.attack();gq.step(dt);}
 assert.equal(gq.snapshot().gate.hp,0,'Dodge + counter opens gate');assert.equal(gq.snapshot().hearts,3);checks++;
}
{
 const {q,e,keys}=create(),foe=enemyFixture(q);foe.phaseTimer=.10;e('dodgeBtn').events.pointerdown({preventDefault(){}});assert(q.snapshot().player.dodge>0,'Pointer control activates dodge');q.jump();q.attack();assert.equal(q.snapshot().player.onGround,true);assert.equal(q.snapshot().player.attack,0,'Cannot attack while dodging');step(q,.1);const cd=q.snapshot().player.dodgeCD;q.dodge();assert.equal(q.snapshot().player.dodgeCD,cd,'Spam cannot reset dodge/cooldown');step(q,.15);assert.equal(q.snapshot().hearts,3);assert(q.snapshot().score>=100,'Successful evasion earns dodge reward');assert(e('dodgeBtn').disabled);const remaining=q.snapshot().player.dodgeCD;e('pause').onclick();step(q,2);assert.equal(q.snapshot().player.dodgeCD,remaining,'Pause freezes cooldown');e('pause').onclick();step(q,.85);assert.equal(q.snapshot().player.dodge,0);checks++;
 const early=create(),enemy=enemyFixture(early.q);early.q.dodge();step(early.q,1.0);assert.equal(early.q.snapshot().hearts,2,'Dodging too early does not evade later strike');checks++;
 const collision=create(),p=collision.q.snapshot().player;collision.q.dodge();const barrier=collision.q.spawn('barrier');barrier.x=p.x+p.w*.31;collision.q.step(1/60);assert.equal(collision.q.snapshot().hearts,2,'Dodge cannot bypass mandatory jump obstacle');checks++;
 const airborne=create();airborne.q.jump();airborne.q.dodge();assert.equal(airborne.q.snapshot().player.dodge,0,'Ground-only evasion');checks++;
 for(const code of ['ShiftLeft','ShiftRight','KeyC','ArrowDown']){const keyboard=create();keyboard.keys.keydown({code,preventDefault(){}});assert(keyboard.q.snapshot().player.dodge>0,'Keyboard dodge '+code);checks++;}
}
{
 const ground=create('training');ground.q.attack();step(ground.q,.1);assert.equal(ground.q.snapshot().player.attackKind,'punch');ground.q.draw();const punch=ground.drawCalls.filter(x=>x.id===2).at(-1);assert.equal(punch.args[1],1152,'Ground attack renders punch row');assert.equal(punch.args[0],384,'Ground attack renders extended fist frame');checks++;
 const air=create('training');air.q.jump();air.q.attack();step(air.q,.1);assert.equal(air.q.snapshot().player.attackKind,'kick');air.q.draw();const kick=air.drawCalls.filter(x=>x.id===2).at(-1);assert.equal(kick.args[1],768,'Air attack renders jump row');assert.equal(kick.args[0],768,'Air attack renders extended kick frame');checks++;
 const jumpOnly=create('training');jumpOnly.q.jump();step(jumpOnly.q,.6);jumpOnly.q.draw();const tuck=jumpOnly.drawCalls.filter(x=>x.id===2).at(-1);assert.equal(tuck.args[0],384,'Jump without attack does not show a kick');checks++;
}
assert(html.includes('id="difficulty"'));assert(!html.includes('Gegner brauchen zwei Treffer'));
console.log(`PASS: ${checks} gameplay checks across 4 viewport sizes, 3 difficulties and 30/60fps. Spam loses; timed dodges/counters and Gate win without damage; pause/healing/progression and dedicated dodge controls/cooldown and punch/jump-kick animations verified.`);
