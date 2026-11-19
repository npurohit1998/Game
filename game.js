const $=s=>document.querySelector(s),cv=$('#cv'),x=cv.getContext('2d'),stage=$('#stage'),ov=$('#ov'),spb=$('[data-k=S]');
const W=800,H=400,GY=340,SP=230,GR=1500,FN='"Baloo 2",system-ui,sans-serif';
const ATK={P:{d:.28,a:[.07,.17],r:60,dmg:6,kb:150},K:{d:.46,a:[.14,.27],r:84,dmg:11,kb:260},D:{d:.5,a:[.1,.4],r:56,dmg:18,kb:300},S:{d:.5}};
const HITS=['L + ratio','Aura -500','NPC निकला','कुर्सी हिल गई!','Skill issue','Cooked 🍳','पोस्टर फट गया','वोट कट गया!','No cap, ज़ोर का था'];
const ME={n:'रील-वीर रिंकू',e:'😎',c:'#4cc9f0',sp:{t:'p',e:'📱',dmg:22,v:460,say:'वायरल रील!'}};
const OPP=[
{n:'वादा-बाज़ बबलू',e:'🤥',c:'#ff9f1c',ds:'फ्री के वादों की बौछार',sp:{t:'p',e:'🛵',dmg:20,v:400,say:'फ्री स्कूटी!'},agg:.5,blk:.2},
{n:'दलबदलू दीनू',e:'🦎',c:'#2ec4b6',ds:'आज इस दल में, कल उस दल में',sp:{t:'d',say:'पलटी!'},agg:.6,blk:.15},
{n:'फ़ोटो-ऑप फुफा',e:'🥸',c:'#9b5de5',ds:'काम कम, कैमरा ज़्यादा',sp:{t:'p',e:'📸',dmg:14,v:540,say:'स्माइल प्लीज़!',stun:.7},agg:.4,blk:.35}];
let P,O,PR=[],TX=[],G={s:'menu',t:0,rn:1,time:40,oi:0,msg:'',sub:''},shake=0,TM=0;
const K={L:0,R:0,B:0},bg=document.createElement('canvas');bg.width=W;bg.height=H;
const txt=(a,b,s,z=18)=>TX.push({x:Math.max(80,Math.min(W-80,a)),y:b,s,sz:z,t:1});
const mk=(b,f)=>({...b,x:0,y:GY,vx:0,vy:0,f,hp:100,m:0,st:'idle',at:0,ad:0,k:'',did:0,stn:0,hit:0,b:0,q:'',qt:0,w:0,I:{L:0,R:0,B:0},ai:.6});
function rnd(){P.x=NETSIDE?580:220;O.x=NETSIDE?220:580;P.f=NETSIDE?-1:1;O.f=-P.f;[P,O].forEach(f=>{f.y=GY;f.vx=f.vy=f.hit=0;f.hp=100;f.m=0;f.st='idle';f.q='';f.b=0;f.I={L:0,R:0,B:0}});PR=[];TX=[];G.s='intro';G.t=0;G.time=40}
function go(i){G.oi=i;P=mk(ME,1);O=mk(OPP[i],-1);G.rn=1;ov.style.display='none';rnd()}
let NET=null,NETSIDE=0,TKN=0,TMR=0,PEERS=[],CONN=null,DP=null;const lv=$('#lv');
function place(){const r=cv.getBoundingClientRect();lv.style.left=(r.left+r.width/2)+'px';lv.style.top=(r.top+r.height*.2)+'px';lv.hidden=ov.style.display=='flex'||!P}
function wait(h,s,e2=''){G.s='menu';ov.style.display='flex';ov.innerHTML=`<h2>${h}</h2><p>${s}</p>${e2}<div class='row'><button class='bt' data-g='x'>रद्द करो</button></div>`}
function bye(m){stopNet();G.s='menu';ov.style.display='flex';ov.innerHTML=`<h2 style='font-size:clamp(20px,5vw,32px)'>${m}</h2><div class='row'><button class='bt' data-g='f'>फिर से ढूँढो</button><button class='bt' data-g='m'>होम</button></div>`}
function menu(){G.s='menu';ov.style.display='flex';ov.innerHTML=`<h1>सरपंच स्मैश</h1><p>वोट दो या चोट खाओ 🗳️👊</p><div class='cards'><button class='oc' data-g='f'><b>⚔️</b>फाइट करो<span>ऑनलाइन खिलाड़ी मिला तो उससे, वरना कंप्यूटर से</span></button><button class='oc' data-g='c'><b>🏠</b>पर्सनल रूम बनाओ<span>रैंडम कोड दोस्त को भेजो</span></button></div><div class='row'><input id='cd' maxlength='5' placeholder='रूम कोड' autocomplete='off'><button class='bt' data-g='j'>रूम में जुड़ो</button></div><p class='sm'>फ़ोन आड़ा करो • कीबोर्ड: A/D चलो, W कूदो, J पंच, K किक, L ब्लॉक, U स्पेशल<br>सारे पात्र और घटनाएँ काल्पनिक हैं 😄</p><button class='bt' data-g='i' id='ib'${DP?'':' hidden'}>📲 फ़ोन में इंस्टॉल करो</button>`}
function cpu(){stopNet();go(Math.random()*3|0);txt(400,270,'कोई ऑनलाइन खिलाड़ी नहीं मिला — कंप्यूटर से भिड़ंत 🤖',16)}
/* ===== ऑनलाइन मल्टीप्लेयर: PeerJS (WebRTC) =====
   क्विक मैच: 4 "स्लॉट" आईडी (q0-q3). खाली स्लॉट पर इंतज़ार करो, भरे स्लॉट से जुड़ जाओ.
   पर्सनल रूम: रैंडम कोड = आईडी. जो पहले बना वो side 0 (होस्ट), जुड़ने वाला side 1. */
const PFX='sarpanchsmash-v1-',PO={debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}};
const num=(v,a,b,z=0)=>{v=+v;return v>=a&&v<=b?v:z};
const ST=['idle','atk','stun','ko'],KK=['','P','K','S','D'];
function stopNet(){TKN++;clearTimeout(TMR);NETSIDE=0;NET=null;CONN=null;PEERS.forEach(p=>{try{p.destroy()}catch(e){}});PEERS=[]}
function mkPeer(id){return new Promise((ok,no)=>{if(typeof Peer=='undefined')return no({type:'nolib'});const p=id?new Peer(id,PO):new Peer(PO);p.on('open',()=>ok(p));p.on('error',no);p.on('disconnected',()=>{try{p.reconnect()}catch(e){}})})}
function dial(p,id){return new Promise(ok=>{let d=0;const c=p.connect(id,{serialization:'json'}),fin=r=>{if(d)return;d=1;clearTimeout(t);p.off('error',h);if(!r)try{c.close()}catch(e){}ok(r?c:null)},h=e=>{if(e&&e.type=='peer-unavailable')fin(0)},t=setTimeout(()=>fin(0),3500);p.on('error',h);c.on('open',()=>fin(1))})}
function begin(s,oi){const B=OPP[oi];NETSIDE=s;P=mk(s?B:ME,s?-1:1);O=mk(s?ME:B,s?1:-1);G.rn=1;ov.style.display='none';rnd()}
function link(c,side,my,mode){
CONN=c;let on=0;const net={rs:null,acc:0,last:performance.now(),send(m){try{c.send(m)}catch(e){}},emit(t,d){this.send({t,d});return Promise.resolve()}};
const quit=()=>{if(mode)bye('रूम भर चुका है या बंद हो गया 🚫');else cpu()};
c.on('data',m=>{if(CONN!==c||!m||typeof m!='object')return;net.last=performance.now();const d=m.d||{};
if(m.t=='go'&&side==1&&!on){on=1;clearTimeout(TMR);NET=net;begin(1,num(m.oi,0,2)|0)}
else if(!on)return;
else if(m.t=='s')net.rs={x:num(m.x,0,800,400),y:num(m.y,-300,340,340),vx:num(m.vx,-900,900),vy:num(m.vy,-900,900),f:m.f<0?-1:1,st:ST.includes(m.st)?m.st:'idle',k:KK.includes(m.k)?m.k:'',at:num(m.at,0,2),ad:num(m.ad,0,2,.5),hp:num(m.hp,0,100,100),m:num(m.m,0,100),b:m.b?1:0,sq:num(m.sq,-1,1),ht:m.ht?1:0};
else if(m.t=='h'&&G.s=='fight')hit({x:num(d.x,-50,850),m:0},P,num(d.d,0,25),num(d.k,0,400),num(d.s,0,1));
else if(m.t=='pr')PR.push({o:O,x:num(d.x,-50,850),y:num(d.y,-50,400),vx:num(d.vx,-800,800),e:String(d.e||'💨').slice(0,4),dmg:0})});
c.on('close',()=>{if(CONN!==c)return;if(!on)quit();else if(G.s!='over')bye('सामने वाले ने गेम छोड़ दिया — रूम ख़त्म 🏃')});
c.on('error',()=>{});
if(side==0){const oi=Math.random()*3|0;on=1;clearTimeout(TMR);net.send({t:'go',oi});NET=net;begin(0,oi)}
else TMR=setTimeout(()=>{if(!on&&CONN===c)quit()},6000)}
function pup(dt){if(G.s=='menu')return;const s=NET.rs;
if(s){O.x+=(s.x-O.x)*Math.min(1,dt*18);O.y=s.y;O.vx=s.vx;O.vy=s.vy;O.f=s.f;O.st=s.st;O.k=s.k;O.at=s.at;O.ad=s.ad||.5;O.hp=s.hp;O.m=s.m;O.b=s.b;O.sq=s.sq;O.hit=s.ht?.03:0}
if(performance.now()-NET.last>7000){bye('कनेक्शन टूट गया — रूम ख़त्म 🔌');return}
NET.acc+=dt;if(NET.acc>=.033){NET.acc=0;NET.send({t:'s',x:P.x|0,y:P.y|0,vx:P.vx|0,vy:P.vy|0,f:P.f,st:P.st,k:P.k,at:+P.at.toFixed(2),ad:P.ad,hp:Math.ceil(P.hp),m:P.m|0,b:P.b,sq:+(P.sq||0).toFixed(2),ht:P.hit>0?1:0})}}
async function fight(){stopNet();const my=++TKN;wait('विरोधी ढूँढ रहे हैं… 🔍','कुछ सेकंड में कोई न मिला तो कंप्यूटर से भिड़ंत होगी');
let me;try{me=await mkPeer()}catch(e){if(my==TKN)cpu();return}
if(my!=TKN){me.destroy();return}PEERS.push(me);
for(let n=0;n<4;n++){const c=await dial(me,PFX+'q'+n);if(my!=TKN)return;if(c)return link(c,1,my,0)}
for(let n=0;n<4;n++){let h;try{h=await mkPeer(PFX+'q'+n)}catch(e){if(my!=TKN)return;if(e&&e.type=='unavailable-id'){const c=await dial(me,PFX+'q'+n);if(my!=TKN)return;if(c)return link(c,1,my,0)}continue}
if(my!=TKN){h.destroy();return}PEERS.push(h);
h.on('connection',cn=>{if(CONN||my!=TKN){cn.close();return}cn.on('open',()=>{if(!CONN&&my==TKN)link(cn,0,my,0);else cn.close()})});
TMR=setTimeout(()=>{if(my==TKN&&!CONN)cpu()},8000);return}
cpu()}
async function create(){stopNet();const my=++TKN;wait('रूम बना रहे हैं…','');const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
for(let t=0;t<5;t++){let c='';for(let i=0;i<5;i++)c+=A[Math.random()*A.length|0];let h;
try{h=await mkPeer(PFX+'r'+c.toLowerCase())}catch(e){if(my!=TKN)return;if(e&&e.type=='unavailable-id')continue;return bye('सर्वर से कनेक्ट नहीं हो सका 😕')}
if(my!=TKN){h.destroy();return}PEERS.push(h);
h.on('connection',cn=>{if(CONN||my!=TKN){cn.close();return}cn.on('open',()=>{if(!CONN&&my==TKN)link(cn,0,my,1);else cn.close()})});
return wait('तुम्हारा रूम कोड','दोस्त को भेजो, वो “रूम में जुड़ो” में डालेगा। उसके आते ही गेम शुरू!',`<h1 style='letter-spacing:6px'>${c}</h1>`)}
bye('रूम नहीं बन सका, फिर कोशिश करो')}
async function joinR(){const c=($('#cd').value||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(c.length!=5){$('#cd').focus();return}
stopNet();const my=++TKN;wait('रूम में जा रहे हैं…','कोड: '+c.toUpperCase());
let me;try{me=await mkPeer()}catch(e){if(my==TKN)bye('सर्वर से कनेक्ट नहीं हो सका 😕');return}
if(my!=TKN){me.destroy();return}PEERS.push(me);
const cn=await dial(me,PFX+'r'+c);if(my!=TKN)return;if(!cn)return bye('ऐसा कोई रूम नहीं मिला 😕');link(cn,1,my,1)}
function over(){G.s='over';const w=P.w>=2;ov.style.display='flex';ov.innerHTML=`<h2>${w?'सरपंच बन गए! 🎉':'ज़मानत ज़ब्त! 💀'}</h2><p>${w?O.n+' चारों खाने चित! पहला आदेश: चौपाल पर फ्री Wi-Fi और रील बनाने की छूट। Aura +9999':'NOTA भी तुमसे आगे निकल गया। Aura -1000, पर वापसी पक्की।'}</p><div class="row"><button class="bt" data-g="r">फिर से लड़ो</button><button class="bt" data-g="m">होम</button></div>`}
ov.onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const g=b.dataset.g;if(g=='m')menu();else if(g=='r')go(G.oi);else go(+g)};
function hit(a,d,dmg,kb,stn){if(NET&&d==O){NET.emit('h',{d:dmg,k:kb,s:stn||0,x:a.x|0}).catch(()=>{});fx(d.x,d.y-70);a.m=Math.min(100,a.m+dmg*1.4);combo(a);HS=.05;return}
const blk=d.b&&d.st=='idle'&&(d.x-a.x)*d.f<0;
if(blk){dmg*=.12;txt(d.x,d.y-125,'🛡️ ब्लॉक!')}
else{d.st='stun';d.stn=stn||.28;d.hit=.25;d.vx=(d.x>a.x?1:-1)*kb;shake=7;HS=.06;fx(d.x,d.y-70);if(Math.random()<.5)txt(d.x,d.y-128,HITS[Math.random()*HITS.length|0])}
d.hp=Math.max(0,d.hp-dmg);combo(a,blk);a.m=Math.min(100,a.m+dmg*1.4);d.m=Math.min(100,d.m+dmg*.8);
if(d.hp<=0){d.st='ko';d.vy=-320;HS=.2;burst(d.x,d.y-70,30);d.vx=(d.x>a.x?1:-1)*220;shake=12}}
function start(f,k){f.st='atk';f.k=k;f.at=0;f.ad=ATK[k].d;f.did=0}
function upd(f,e,I,dt){
if(f.hit>0)f.hit-=dt;
if(f.qt>0){f.qt-=dt;if(f.qt<=0)f.q=''}
const air=f.y<GY;
if(f.st=='ko')f.vx*=.96;
else if(f.st=='stun'){f.stn-=dt;f.vx*=.9;if(f.stn<=0)f.st='idle'}
else if(f.st=='atk'){f.at+=dt;const A=ATK[f.k];f.vx*=.88;
if(f.k=='D')f.vx=(f.at>.1&&f.at<.4)?f.f*520:0;
if(f.k=='S'&&!f.did&&f.at>.2){f.did=1;const s=f.sp;PR.push({o:f,x:f.x+f.f*30,y:f.y-70,vx:f.f*s.v,e:s.e,dmg:s.dmg,stun:s.stun});txt(f.x,f.y-140,s.say,22);if(NET&&f==P)NET.emit('pr',{x:f.x+f.f*30,y:f.y-70,vx:f.f*s.v,e:s.e}).catch(()=>{})}
else if(A.a&&!f.did&&f.at>=A.a[0]&&f.at<=A.a[1]){const dx=(e.x-f.x)*f.f;if(dx>-14&&dx<A.r&&Math.abs(e.y-f.y)<70&&e.st!='ko'){f.did=1;hit(f,e,A.dmg,A.kb)}}
if(f.at>=f.ad)f.st='idle'}
if(f.st=='idle'){
f.f=e.x>f.x?1:-1;f.b=!air&&I.B?1:0;f.vx=f.b?0:(I.R-I.L)*SP;
if(f.q){const k=f.q;f.q='';
if(k=='J'){if(!air){f.vy=-570;f.sq=-.3;dust(f.x,GY,5)}}
else if(k=='P'||k=='K')start(f,k);
else if(k=='S'){if(f.m>=100){f.m=0;start(f,f.sp.t=='d'?'D':'S')}else if(f==P)txt(f.x,f.y-130,'मीटर भरो!',16)}}}
if(f.st!='idle')f.b=0;
f.x=Math.max(36,Math.min(W-36,f.x+f.vx*dt));
f.vy+=GR*dt;f.y+=f.vy*dt;f.sq=(f.sq||0)*.9;if(f.y>=GY){if(f.vy>350){dust(f.x,GY,8);f.sq=.3}f.y=GY;f.vy=0}}
function ai(o,p,dt){o.ai-=dt;if(o.ai>0)return;o.ai=.1+Math.random()*.2;
const d=Math.abs(p.x-o.x),r=Math.random(),to=p.x>o.x?'R':'L',aw=to=='R'?'L':'R';o.I={L:0,R:0,B:0};
if(o.m>=100&&d>130&&r<.7){o.q='S';o.qt=.3;return}
if(p.st=='atk'&&d<120&&r<o.blk+.15){o.I.B=1;return}
if(d>80){o.I[to]=1;if(r<.05){o.q='J';o.qt=.3}}
else if(r<o.agg){o.q=Math.random()<.55?'P':'K';o.qt=.3}
else if(r<o.agg+.2)o.I[aw]=1}
function endR(){G.s='rend';G.t=0;const w=P.hp>O.hp?P:O.hp>P.hp?O:0;
if(w){w.w++;for(let i=0;i<30;i++)burst(w.x,w.y-80,1,1);G.msg=(P.hp<=0||O.hp<=0)?'K.O.! ज़मानत ज़ब्त 💀':'टाइम अप! वोट गिने गए 🗳️';G.sub=w.n+' ने राउंड जीता'}
else{G.msg='बराबरी! NOTA जीता 🤷';G.sub=''}}
function step(dt){
const F=G.s=='fight',Z={L:0,R:0,B:0};
if(F){if(!NET)ai(O,P,dt)}else P.q=O.q='';
upd(P,O,F?K:Z,dt);if(NET)pup(dt);else upd(O,P,F?O.I:Z,dt);
const dx=O.x-P.x;if(Math.abs(dx)<38&&Math.abs(O.y-P.y)<60){const s=(38-Math.abs(dx))/2*(dx<0?-1:1);P.x-=s;O.x+=s}
PR.forEach(p=>{p.x+=p.vx*dt;const e=p.o==P?O:P;if(!(NET&&p.o==O)&&e.st!='ko'&&Math.abs(e.x-p.x)<28&&Math.abs(e.y-50-p.y)<50){hit(p.o,e,p.dmg,220,p.stun);p.x=-999}});
PR=PR.filter(p=>p.x>-40&&p.x<W+40);
G.t+=dt;
if(G.s=='intro'&&G.t>1.7){G.s='fight';G.t=0}
else if(F){G.time-=dt;if(P.hp<=0||O.hp<=0||G.time<=0)endR()}
else if(G.s=='rend'&&G.t>2.6){if(P.w>=2||O.w>=2)over();else{G.rn++;rnd()}}
shake*=.88;TX.forEach(t=>{t.t-=dt;t.y-=30*dt});TX=TX.filter(t=>t.t>0)}
function rr(a,b,w,h,r){x.beginPath();x.roundRect?x.roundRect(a,b,w,h,r):x.rect(a,b,w,h);x.fill()}
function label(s,a,b,z,col='#ffd166',al='center'){x.font=`800 ${z}px ${FN}`;x.textAlign=al;x.lineWidth=5;x.lineJoin='round';x.strokeStyle='#1d1208';x.strokeText(s,a,b);x.fillStyle=col;x.fillText(s,a,b)}
let HS=0,S=[];
const OL='#2a1608',SK=['#f1c27d','#e0a370','#c68642','#f5cba7'],ON=['धड़ाम!','ठाँय!','चटाक!','POW!','BAM!'],CR=['🧑‍🌾','👵','🧔','🧒','👳','🤳','👩‍🦱'];
function E(a,b,rx,ry,c){x.fillStyle=c;x.lineWidth=3;x.strokeStyle=OL;x.beginPath();x.ellipse(a,b,rx,ry,0,0,7);x.fill();x.stroke()}
function L(a,b,c,d,w,col){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=w+5;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle=col;x.lineWidth=w;x.stroke()}
function dust(a,b,n){for(let i=0;i<n;i++)S.push({k:'d',x:a+(Math.random()-.5)*20,y:b-2,vx:(Math.random()-.5)*60,vy:-20-Math.random()*30,t:.5,m:.5})}
function burst(a,b,n,cf){for(let i=0;i<n;i++){const g=Math.random()*6.28,v=120+Math.random()*260;S.push({k:cf?'c':'p',x:a,y:b,vx:Math.cos(g)*v,vy:Math.sin(g)*v-(cf?250:0),t:cf?1.6:.45,m:cf?1.6:.45,c:cf?`hsl(${Math.random()*360},90%,60%)`:['#fff','#ffd166','#ff6b6b'][i%3]})}}
function fx(a,b){S.push({k:'s',x:a,y:b,t:.22,m:.22});burst(a,b,8);txt(a,b-34,ON[Math.random()*5|0],28)}
function combo(a,b){if(b){a.cb=0;return}a.cb=(a.cbt>0?a.cb:0)+1;a.cbt=1.4;if(a.cb>1)txt(a.x,a.y-150,'कॉम्बो x'+a.cb+' 🔥',24)}
function parts(dt){[P,O].forEach(f=>{if(f&&f.cbt>0)f.cbt-=dt});S.forEach(p=>{p.t-=dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;if(p.k=='c'||p.k=='p')p.vy+=500*dt});S=S.filter(p=>p.t>0)}
function drawParts(){S.forEach(p=>{const u=p.t/p.m;x.globalAlpha=Math.min(1,u*1.5);
if(p.k=='s'){x.fillStyle='#fff7a8';x.strokeStyle='#ff6b00';x.lineWidth=3;x.beginPath();const R=60-u*28;for(let i=0;i<16;i++){const r=i%2?R*.45:R,a=i*Math.PI/8;x.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()}
else if(p.k=='d'){x.fillStyle='#e8d5b0';x.beginPath();x.arc(p.x,p.y,(1-u)*12+4,0,7);x.fill()}
else{x.fillStyle=p.c;x.fillRect(p.x,p.y,p.k=='c'?7:5,p.k=='c'?4:5)}});x.globalAlpha=1}
function popT(t){t.r??=(Math.random()-.5)*.35;x.save();x.translate(t.x,t.y);x.rotate(t.r);const s=1+Math.max(0,t.t-.75)*2.4;x.scale(s,s);x.globalAlpha=Math.min(1,t.t*2);label(t.s,0,0,t.sz);x.restore()}
function proj(p){x.save();x.translate(p.x,p.y);x.rotate(TM*12);x.shadowColor='#ffd166';x.shadowBlur=20;x.font='42px serif';x.textAlign='center';x.fillText(p.e||'💨',0,14);x.restore();if(Math.random()<.6)S.push({k:'p',x:p.x,y:p.y,vx:-p.vx*.1,vy:0,t:.3,m:.3,c:'#ffd166'})}
function scene(){place();
x.save();x.translate(660,130);x.rotate(TM*.25);x.fillStyle='rgba(255,224,102,.35)';for(let i=0;i<12;i++){x.rotate(Math.PI/6);x.fillRect(-5,-95,10,42)}x.restore();
x.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<4;i++){const c=((TM*10+i*270)%1100)-150,y=[60,45,70,52][i];[[0,0,18],[20,-9,24],[44,0,16]].forEach(([a,b,r])=>{x.beginPath();x.arc(c+a,y+b,r,0,7);x.fill()})}
const ch=S.some(p=>p.k=='s')?2.4:1;x.font='30px serif';x.textAlign='center';
for(let i=0;i<14;i++){const px=i<7?18+i*42:510+(i-7)*42;x.fillText(CR[i%7],px,GY-12-Math.abs(Math.sin(TM*4+i*1.3))*7*ch)}}
function drawF(f){
const id=['😎','🤥','🦎','🥸'].indexOf(f.e),A=f.st=='atk'?ATK[f.k]:0,k=A?f.k:'',pr=A?Math.min(1,f.at/f.ad):0,ex=A&&A.r?A.r*Math.sin(Math.PI*pr):0;
const mv=f.st=='idle'&&f.y>=GY&&Math.abs(f.vx)>10,wk=mv?Math.sin(TM*16):0,air=f.y<GY-4,hi=f.st=='stun',ko=f.st=='ko',sk=SK[id];
if((mv&&Math.random()<.12)||(k=='D'&&Math.random()<.6))dust(f.x,GY,1);
x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(f.x,GY,Math.max(8,28-(GY-f.y)/8),6,0,0,7);x.fill();
x.save();x.translate(f.x,f.y);x.scale(f.f,1);
if(f.hit>0&&((f.hit*40)|0)%2)x.globalAlpha=.6;
if(ko){if(air){x.translate(0,-50);x.rotate(-TM*12);x.translate(0,50)}else{x.rotate(-1.5);x.translate(14,0)}}
else{const s=(f.sq||0)+(air?-Math.min(.14,Math.abs(f.vy)/3500):0)+(hi?.12:0);x.rotate(.1*Math.sin(Math.PI*pr)*(k=='P'||k=='K'?1:0)+(k=='D'?.3:0)+wk*.04-(hi?.2:0));x.scale(1+s,1-s)}
const bob=f.st=='idle'&&!air?Math.sin(TM*5+id)*1.8:0,ey=-98+bob,bl=Math.sin(TM*2.3+id*2)>.96;
let hx=22+wk*6,hy=-46+bob,bx=-22-wk*6,by=-48+bob;
if(f.b){hx=26;hy=-80;bx=24;by=-62}else if(k=='P'){hx=26+ex;hy=-74;bx=-20;by=-56}else if(k=='S'){hx=20;hy=-122;bx=-14;by=-120}else if(k=='K'){hx=-6;hy=-62;bx=-24;by=-80}else if(air){hx=24;hy=-84;bx=-22;by=-84}else if(id==1&&!mv&&!hi&&!ko){hx=bx=14;hy=by=-60}
if(f.m>=100||k=='S'||k=='D'){x.globalAlpha=.3+.15*Math.sin(TM*12);x.fillStyle='#ffe066';x.beginPath();x.arc(0,-62,56+5*Math.sin(TM*12),0,7);x.fill();x.globalAlpha=1}
L(-14,-68+bob,bx,by,9,f.c);E(bx,by,7,7,sk);
const hy1=-32+bob,kk=k=='K',fx1=kk?14+ex:8+wk*12,fy1=kk?-42-ex*.1:air?-16:-2-Math.max(0,wk)*6,fx2=-8-wk*12,fy2=air?-12:-2-Math.max(0,-wk)*6;
L(-8,hy1,fx2,fy2,11,'#3a2a1a');L(8,hy1,fx1,fy1,11,'#3a2a1a');E(fx2+3,fy2,9,5,'#222');E(fx1+3,fy1,9,5,'#222');
E(0,-52+bob,id==1?27:id==2?17:id==3?19:21,24,f.c);
if(id==0){L(-5,-68+bob,-5,-52+bob,2,'#fff');L(6,-68+bob,6,-52+bob,2,'#fff')}
if(id==1)for(let i=0;i<7;i++)E(-18+i*6,-72+bob+(3-Math.abs(i-3))*4,5,5,i%2?'#ff9f1c':'#ffd60a');
if(id==2){const c=`hsl(${TM*220%360},85%,55%)`;L(14,-72+bob,-8,-70+bob,9,c);L(-8,-70+bob,-24,-56+bob+Math.sin(TM*8)*3,7,c)}
if(id==3){L(-8,-74+bob,6,-50+bob,3,'#111');E(7,-47+bob,10,8,'#333');E(9,-47+bob,4,4,'#9cf')}
E(2,-96+bob,27,25,sk);
if(id==0){E(0,-114+bob,24,11,'#ff7f11');E(-25,-108+bob,13,4,'#ff7f11')}
if(id==2){E(0,-115+bob,25,10,'#111');E(20,-119+bob,8,6,'#111')}
if(id==3)E(0,-117+bob,22,9,'#fff');
if(ko)[-6,10].forEach(a=>{L(a-4,ey-4,a+4,ey+4,2,OL);L(a-4,ey+4,a+4,ey-4,2,OL)});
else if(hi)[-6,10].forEach(a=>{L(a-4,ey-4,a+3,ey,2,OL);L(a-4,ey+4,a+3,ey,2,OL)});
else if(id==0&&!bl){E(-6,ey,10,7,'#111');E(11,ey,10,7,'#111');L(-1,ey,3,ey,2,'#111')}
else[-6,10].forEach(a=>{E(a,ey,7,bl?1.5:k?6:9,'#fff');if(!bl)E(a+3,ey+1,3,3,'#111')});
if(id==3&&!ko){x.strokeStyle='#222';x.lineWidth=3;x.fillStyle='rgba(180,220,255,.35)';[-6,10].forEach(a=>{x.beginPath();x.arc(a,ey,11,0,7);x.fill();x.stroke()})}
if(k&&!hi&&!ko){L(-14,ey-13,-1,ey-7,3,OL);L(19,ey-13,4,ey-7,3,OL)}
if(ko)E(4,-82+bob,5,8,'#ff6b81');
else if(k)E(5,-83+bob,8,k=='S'?11:6,'#5a0a0a');
else if(hi)L(-3,-82+bob,12,-84+bob,3,OL);
else{x.strokeStyle=OL;x.lineWidth=3;x.beginPath();x.arc(4,-90+bob,8,.3,2.8);x.stroke()}
if(id==1)E(3,-90+bob,15,5,'#222');
L(14,-68+bob,hx,hy,9,f.c);const g=k=='P';E(hx,hy,g?11:7,g?11:7,g?'#e63946':sk);
if(g){x.globalAlpha=.3;for(let i=1;i<4;i++)E(hx-i*ex*.2,hy,9,9,'#fff');x.globalAlpha=1}
if(id==0&&!g&&!ko){x.font='20px serif';x.textAlign='center';x.fillText('📱',hx+4,hy+6)}
if(k=='S'){x.globalAlpha=.5;x.fillStyle='#ffe066';x.beginPath();x.arc(34,-96,30*Math.sin(Math.PI*pr)+6,0,7);x.fill();x.globalAlpha=1}
if(f.b)E(36,-68,9,34,'rgba(142,202,230,.65)');
x.restore()}
function hud(){
[[P,16,1],[O,W-316,-1]].forEach(([f,bx,d])=>{
x.fillStyle='rgba(0,0,0,.55)';x.fillRect(bx-3,22,306,24);
const w=300*f.hp/100;x.fillStyle=f.hp>50?'#7bd957':f.hp>25?'#ffd166':'#ef476f';
d>0?x.fillRect(bx,24,w,16):x.fillRect(bx+300-w,24,w,16);
const mw=300*f.m/100;x.fillStyle=f.m>=100&&Math.sin(TM*14)>0?'#fff':'#4cc9f0';
d>0?x.fillRect(bx,44,mw,5):x.fillRect(bx+300-mw,44,mw,5);
label(f.n+' '+f.e,d>0?bx:bx+300,17,15,'#fff',d>0?'left':'right');
x.font=`800 11px ${FN}`;x.textAlign='center';x.fillStyle='#1d1208';x.fillText(Math.ceil(f.hp)+'% जनसमर्थन',bx+150,36);
x.font='16px serif';for(let i=0;i<2;i++){x.globalAlpha=i<f.w?1:.3;x.fillText('🗳️',d>0?bx+10+i*20:bx+290-i*20,68)}x.globalAlpha=1});
x.fillStyle='rgba(0,0,0,.6)';x.beginPath();x.arc(400,34,22,0,7);x.fill();
label(Math.max(0,Math.ceil(G.time))+'',400,42,22,G.time<10?'#ff6b6b':'#fff')}
function render(){
x.save();if(shake>.5)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
x.drawImage(bg,0,0);scene();
if(P){drawF(P);drawF(O);x.font='34px serif';x.textAlign='center';PR.forEach(proj);drawParts();
TX.forEach(popT);x.globalAlpha=1;hud();
if(G.s=='intro')label(G.t<1?'राउंड '+G.rn:'भिड़ जाओ! 🗳️👊',400,200,54);
if(G.s=='rend'){label(G.msg,400,180,40);if(G.sub)label(G.sub,400,225,22)}}
x.restore();spb.classList.toggle('rdy',!!P&&P.m>=100&&G.s=='fight')}
function mkbg(){const c=bg.getContext('2d');
const g=c.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#ff9e5e');g.addColorStop(.6,'#ffd9a0');g.addColorStop(1,'#fff1cf');c.fillStyle=g;c.fillRect(0,0,W,H);
c.fillStyle='#ffe066';c.beginPath();c.arc(660,130,44,0,7);c.fill();
c.fillStyle='#a8c76f';c.beginPath();c.ellipse(120,GY,300,90,0,Math.PI,0);c.fill();
c.fillStyle='#8fb85a';c.beginPath();c.ellipse(640,GY,330,70,0,Math.PI,0);c.fill();
c.fillStyle='#6b4226';c.fillRect(238,100,4,GY-100);c.fillRect(558,100,4,GY-100);
c.fillStyle='#f4d9a8';c.fillRect(310,205,180,135);
c.fillStyle='#c2512d';c.beginPath();c.moveTo(295,205);c.lineTo(400,150);c.lineTo(505,205);c.fill();
c.fillStyle='#6b4226';c.fillRect(380,282,40,58);
c.fillStyle='#8ecae6';c.fillRect(327,252,38,30);c.fillRect(435,252,38,30);
c.fillStyle='#fff';c.fillRect(335,210,130,34);
c.fillStyle='#1d1208';c.textAlign='center';c.font=`800 14px ${FN}`;c.fillText('ग्राम पंचायत',400,224);c.font=`600 10px ${FN}`;c.fillText('समय: 11 बजे* (*कभी-कभी)',400,238);
c.fillStyle='#d62828';c.fillRect(244,100,312,32);
c.fillStyle='#fff';c.font=`800 17px ${FN}`;c.fillText('भावी सरपंच: वोट दो, रील देखो!',400,122);
const cl=['#ef476f','#ffd166','#06d6a0','#118ab2'];
for(let i=0;i<20;i++){const a=i*40,y=84+Math.sin(i/19*Math.PI)*14;c.fillStyle=cl[i%4];c.beginPath();c.moveTo(a,y);c.lineTo(a+40,y);c.lineTo(a+20,y+18);c.fill()}
c.font='90px serif';c.fillText('🌳',62,336);c.font='80px serif';c.fillText('🌳',745,336);c.font='38px serif';c.fillText('🐃',160,338);
c.fillStyle='#b5835a';c.fillRect(0,GY,W,H-GY);c.fillStyle='#7fb069';c.fillRect(0,GY,W,6);
c.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<30;i++)c.fillRect((i*97)%W,GY+14+(i*31)%50,6,3)}
const key={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',l:'B',ArrowUp:'J',w:'J',' ':'J',j:'P',z:'P',k:'K',x:'K',u:'S',i:'S'};
function press(k,v){if(k=='L'||k=='R'||k=='B')K[k]=v;else if(v&&P){P.q=k;P.qt=.2}}
const kc=e=>key[e.key.length>1?e.key:e.key.toLowerCase()];
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;const k=kc(e);if(k){e.preventDefault();if(!e.repeat)press(k,1)}});
addEventListener('keyup',e=>{const k=kc(e);if(k)press(k,0)});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k,up=()=>{b.classList.remove('on');press(k,0)};
b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');press(k,1)});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,up))});
document.addEventListener('contextmenu',e=>e.preventDefault());
function fit(){const L=matchMedia('(orientation:landscape)').matches,h=L?stage.clientHeight:1e5;let cw=stage.clientWidth,ch=cw/2;if(ch>h){ch=h;cw=h*2}cv.style.width=cw+'px';cv.style.height=ch+'px'}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));
function frame(ts){const dt=Math.min(.033,(ts-(frame.l||ts))/1000);frame.l=ts;TM+=dt;if(HS>0)HS-=dt;else if(P)step(dt*(G.s=='rend'&&G.t<.6?.35:1));parts(dt);render();requestAnimationFrame(frame)}
ov.onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const g=b.dataset.g;if(g=='f'||g=='r')fight();else if(g=='c')create();else if(g=='j')joinR();else if(g=='m'||g=='x'){stopNet();menu()}else if(g=='i'&&DP){DP.prompt();DP=null;$('#ib').hidden=true}};lv.onclick=()=>{stopNet();menu()};addEventListener('beforeinstallprompt',e=>{e.preventDefault();DP=e;const b=$('#ib');if(b)b.hidden=false});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
fit();mkbg();if(document.fonts)document.fonts.ready.then(mkbg);menu();requestAnimationFrame(frame);
