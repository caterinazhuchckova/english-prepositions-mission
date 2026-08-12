(() => {
"use strict";
const IMG="assets/images/", TRACKER="assets/tracker/", UI="assets/ui/", SOUND="assets/sounds/";
const STORAGE_KEY="cosmic_prepositions_final_v1";
const TASKS=[
{id:"in_box",image:"cat_in_box.png",prep:"in",object:"the box",sentence:"The cat is in the box."},
{id:"on_box",image:"cat_on_box.png",prep:"on",object:"the box",sentence:"The cat is on the box."},
{id:"under_table",image:"cat_under_table.png",prep:"under",object:"the table",sentence:"The cat is under the table."},
{id:"behind_chair",image:"cat_behind_chair.png",prep:"behind",object:"the chair",sentence:"The cat is behind the chair."},
{id:"front_box",image:"cat_in_front_of_box.png",prep:"in front of",object:"the box",sentence:"The cat is in front of the box."},
{id:"next_sofa",image:"cat_next_to_sofa.png",prep:"next to",object:"the sofa",sentence:"The cat is next to the sofa."},
{id:"between",image:"cat_between_table_and_box.png",prep:"between",object:"the table and the box",sentence:"The cat is between the table and the box."},
{id:"near_lamp",image:"cat_near_lamp.png",prep:"near",object:"the lamp",sentence:"The cat is near the lamp."}
];
const MISSIONS=[
{id:"sentence",num:1,title:"Sentence Builder",objective:"Repair the Sentence Console",desc:"Look at the picture and build the complete sentence in the correct order.",badge:"Sentence Star",cover:"cover_sentence_builder.png"},
{id:"shooter",num:2,title:"Picture Shooter",objective:"Restore the Location Radar",desc:"Aim the cosmic blaster and shoot the picture that matches the phrase.",badge:"Picture Hunter",cover:"cover_picture_shooter.png"},
{id:"typing",num:3,title:"Type the Preposition",objective:"Enter the Secret Words",desc:"Look, listen and type the missing preposition.",badge:"Preposition Master",cover:"cover_type_preposition.png"}
];
const AUDIO={button:"button.mp3",correct:"correct.mp3",wrong:"wrong.mp3",shot:"shot.mp3",hit:"hit.mp3",typing:"typing.mp3",win:"win.mp3",in:"in.mp3",on:"on.mp3",under:"under.mp3",behind:"behind.mp3","in front of":"in_front_of.mp3","next to":"next_to.mp3",between:"between.mp3",near:"near.mp3"};
const $=id=>document.getElementById(id);
const screens={home:$("homeScreen"),setup:$("setupScreen"),game:$("gameScreen"),result:$("resultScreen")};
const state={progress:loadProgress(),mission:null,round:0,tasks:[],correct:0,score:0,attempts:0,sounds:true};

function blankProgress(){return{sentence:{done:false,stars:0,best:0},shooter:{done:false,stars:0,best:0},typing:{done:false,stars:0,best:0}}}
function loadProgress(){try{return{...blankProgress(),...(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||{})}}catch{return blankProgress()}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.progress))}
function totalStars(){return MISSIONS.reduce((s,m)=>s+(state.progress[m.id]?.stars||0),0)}
function completed(){return MISSIONS.filter(m=>state.progress[m.id]?.done).length}
function stage(){return Math.min(9,totalStars())}
function isUnlocked(id){const i=MISSIONS.findIndex(m=>m.id===id);return i===0||Boolean(state.progress[MISSIONS[i-1].id]?.done)}
function starString(n){return"★".repeat(n)+"☆".repeat(3-n)}
function trackerSrc(n=stage()){return `${TRACKER}house_stage_${Math.max(0,Math.min(9,n))}.svg`}
function show(name){Object.entries(screens).forEach(([k,v])=>v.classList.toggle("active",k===name));$("homeBtn").classList.toggle("hidden",name==="home");window.scrollTo(0,0)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function calcStars(correct,total=8){if(correct>=7)return 3;if(correct>=5)return 2;if(correct>=3)return 1;return 0}
function audio(name,vol=.85){if(!state.sounds)return;const f=AUDIO[name]||name;if(!f)return;try{const a=new Audio(SOUND+f);a.volume=vol;a.play().catch(()=>{})}catch{}}

function renderHome(){
 const stars=totalStars(), parts=stage(), done=completed(), pct=Math.round(stars/9*100), next=MISSIONS.find(m=>!state.progress[m.id].done);
 $("houseImage").src=trackerSrc(parts);$("progressFill").style.width=`${pct}%`;$("overallPercent").textContent=`${pct}%`;$("partsText").textContent=`${parts} / 9 parts`;
 $("missionMetric").textContent=`${done} / 3`;$("starMetric").textContent=`${stars} / 9`;$("nextMetric").textContent=next?`Mission ${next.num}`:"Complete";
 $("progressText").textContent=parts===0?"Earn your first star and the building will begin.":parts<9?`The cosmic home has ${parts} of 9 parts. Every new star adds another detail.`:"Your cosmic home is complete! Replay missions to improve your scores.";
 renderCards();
}
function renderCards(){
 const host=$("missionCards");host.innerHTML="";
 MISSIONS.forEach(m=>{const p=state.progress[m.id],unlock=isUnlocked(m.id);const card=document.createElement("article");card.className=`mission-card glass-card ${!unlock?"locked-card":""} ${p.done?"completed-card":""}`;
 card.innerHTML=`<img class="mission-thumb" src="${IMG+m.cover}" alt="${m.title}"><div class="mission-copy"><span class="kicker">MISSION ${m.num}</span><h3>${m.title}</h3><p class="objective">${m.objective}</p><p>${m.desc}</p><div class="stars">${starString(p.stars||0)}</div></div><div class="mission-actions"><button class="primary-btn" data-open="${m.id}" ${unlock?"":"disabled"}>${p.done?"Replay":"Start"}</button><button class="secondary-btn" data-preview="${m.id}">Preview</button></div>`;
 host.append(card);
 });
 host.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openSetup(b.dataset.open));host.querySelectorAll("[data-preview]").forEach(b=>b.onclick=()=>openSetup(b.dataset.preview));
}
function openSetup(id){const m=MISSIONS.find(x=>x.id===id);state.mission=m;$("setupKicker").textContent=`MISSION ${m.num}`;$("setupTitle").textContent=m.title;$("setupDesc").textContent=m.desc;$("setupObjective").textContent=m.objective;$("setupReward").textContent=`Reward: up to 3 stars · ${m.badge}`;$("setupHouse").src=trackerSrc();$("setupStars").textContent=`${totalStars()} / 9 stars`;$("startBtn").disabled=!isUnlocked(id);show("setup")}
function startMission(){state.round=0;state.correct=0;state.score=0;state.attempts=0;state.tasks=shuffle(TASKS);$("gameKicker").textContent=`MISSION ${state.mission.num}`;$("gameTitle").textContent=state.mission.title;show("game");nextRound()}
function nextRound(){state.round++;if(state.round>state.tasks.length)return finishMission();updateStats();const task=state.tasks[state.round-1];if(state.mission.id==="sentence")renderSentence(task);else if(state.mission.id==="shooter")renderShooter(task);else renderTyping(task)}
function updateStats(){const played=Math.max(0,state.round-1),pct=Math.round(played/8*100),ls=calcStars(state.correct);$("roundStat").textContent=`${Math.min(state.round,8)} / 8`;$("scoreStat").textContent=state.score;$("correctStat").textContent=state.correct;$("liveStarsStat").textContent=`${ls} / 3`;$("roundFill").style.width=`${pct}%`;$("roundPercent").textContent=`${pct}%`}
function registerCorrect(){state.correct++;state.score+=10;audio("correct");updateStats()}
function registerWrong(){state.attempts++;state.score=Math.max(0,state.score-2);audio("wrong");updateStats()}
function feedback(el,text,ok){el.textContent=text;el.className=`feedback show ${ok?"correct":"wrong"}`}

function renderSentence(task){
 const parts=shuffle([{k:"s",t:"The cat"},{k:"v",t:"is"},{k:"p",t:task.prep},{k:"o",t:task.object}]);let answer=[],locked=false;
 $("gameArea").innerHTML=`<div class="mission-layout sentence-layout"><div class="visual-panel"><img class="task-image" src="${IMG+task.image}" alt="${task.sentence}"></div><div class="task-panel"><p class="instruction">Tap the sentence parts in the correct order.</p><div id="slots" class="answer-slots"></div><div id="bank" class="word-bank"></div><div id="fb" class="feedback"></div><div class="task-buttons"><button id="check" class="primary-btn">Check</button><button id="clear" class="secondary-btn">Clear</button><button id="continue" class="ghost-btn" disabled>Next</button></div></div></div>`;
 const slots=$("slots"),bank=$("bank"),fb=$("fb");
 function draw(){slots.innerHTML="";bank.innerHTML="";answer.forEach((p,i)=>slots.append(tile(p,()=>{if(locked)return;answer.splice(i,1);audio("button",.4);draw()},true)));parts.filter(p=>!answer.includes(p)).forEach(p=>bank.append(tile(p,()=>{if(locked)return;answer.push(p);audio("button",.4);draw()},false)))}
 function tile(p,fn,sel){const b=document.createElement("button");b.className=`word-tile ${sel?"selected":""}`;b.textContent=p.t;b.onclick=fn;return b}
 $("check").onclick=()=>{if(locked)return;if(answer.length<4)return feedback(fb,"Choose all four parts first.",false);const ok=answer.map(x=>x.k).join("")==="svpo";if(ok){locked=true;registerCorrect();feedback(fb,task.sentence,true);$("continue").disabled=false}else{registerWrong();feedback(fb,"Try again. Check the word order.",false)}};
 $("clear").onclick=()=>{if(locked)return;answer=[];fb.className="feedback";draw()};$("continue").onclick=nextRound;draw();
}
function renderShooter(task){
 const options=shuffle([task,...shuffle(TASKS.filter(t=>t.id!==task.id)).slice(0,3)]);let locked=false;
 $("gameArea").innerHTML=`<div class="mission-layout shooter-layout"><div class="shooter-prompt"><div class="prompt-chip">${task.prep.toUpperCase()} ${task.object.toUpperCase()}</div><span class="instruction">Move the aim and shoot the correct picture.</span></div><div id="arena" class="shooter-arena"><div id="targets" class="target-grid"></div><div id="reticle" class="reticle"></div><div id="blaster" class="blaster-wrap"><img src="${UI}space_blaster.svg" alt="Cosmic blaster"></div><div id="flash" class="shot-flash"></div><div id="shootFb" class="feedback shooter-feedback"></div></div></div>`;
 const arena=$("arena"),targets=$("targets"),reticle=$("reticle"),blaster=$("blaster"),flash=$("flash"),fb=$("shootFb");
 options.forEach(opt=>{const b=document.createElement("button");b.className="target-card";b.innerHTML=`<img src="${IMG+opt.image}" alt="${opt.sentence}">`;b.onpointerenter=()=>aimAtElement(b);b.onclick=e=>shoot(e,b,opt);targets.append(b)});
 function aimPoint(clientX,clientY){const r=arena.getBoundingClientRect(),x=clientX-r.left,y=clientY-r.top;reticle.style.left=`${x-17}px`;reticle.style.top=`${y-17}px`;reticle.style.opacity=1;const dx=x-r.width/2,dy=y-(r.height-40);const angle=Math.max(-24,Math.min(24,Math.atan2(dy,dx)*180/Math.PI+90));blaster.style.transform=`translateX(-50%) rotate(${angle}deg)`}
 function aimAtElement(el){const r=el.getBoundingClientRect();aimPoint(r.left+r.width/2,r.top+r.height/2)}
 arena.onpointermove=e=>{if(e.pointerType!=="touch")aimPoint(e.clientX,e.clientY)};arena.onpointerleave=()=>reticle.style.opacity=.25;
 function shoot(e,button,opt){if(locked)return;const br=button.getBoundingClientRect(),tx=e.clientX||br.left+br.width/2,ty=e.clientY||br.top+br.height/2;aimPoint(tx,ty);fireBeam(tx,ty,arena,flash);audio("shot",.8);const ok=opt.id===task.id;if(ok){locked=true;button.classList.add("hit");setTimeout(()=>audio("hit",.9),80);registerCorrect();feedback(fb,"Direct hit! Correct picture.",true);setTimeout(nextRound,720)}else{button.classList.add("miss");registerWrong();feedback(fb,"Miss! Try another target.",false);setTimeout(()=>button.classList.remove("miss"),420)}}
}
function fireBeam(tx,ty,arena,flash){let beam=document.querySelector(".laser-beam");if(!beam){beam=document.createElement("div");beam.className="laser-beam";document.body.append(beam)}const ar=arena.getBoundingClientRect();const sx=ar.left+ar.width/2+130,sy=ar.bottom-47;const dx=tx-sx,dy=ty-sy,len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)*180/Math.PI;beam.style.left=`${sx}px`;beam.style.top=`${sy}px`;beam.style.width=`${len}px`;beam.style.transform=`rotate(${ang}deg)`;beam.classList.remove("fire");void beam.offsetWidth;beam.classList.add("fire");flash.classList.remove("fire");void flash.offsetWidth;flash.classList.add("fire")}
function renderTyping(task){
 $("gameArea").innerHTML=`<div class="mission-layout typing-layout"><div class="visual-panel"><img class="task-image" src="${IMG+task.image}" alt="${task.sentence}"></div><div class="task-panel typing-panel"><p class="type-sentence">The cat is ____ ${task.object}.</p><p class="instruction">Listen and type the missing preposition.</p><button id="listen" class="secondary-btn listen-btn">🔊 Listen again</button><input id="typeInput" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the preposition"><div id="fb" class="feedback"></div><div class="task-buttons"><button id="check" class="primary-btn">Check</button><button id="clear" class="secondary-btn">Clear</button><button id="continue" class="ghost-btn" disabled>Next</button></div></div></div>`;
 const input=$("typeInput"),fb=$("fb");let locked=false;const playWord=()=>audio(task.prep,.95);$("listen").onclick=playWord;setTimeout(playWord,220);input.onkeydown=e=>{if(e.key==="Enter")$("check").click()};input.oninput=()=>audio("typing",.18);
 $("check").onclick=()=>{if(locked)return;const val=input.value.trim().toLowerCase().replace(/\s+/g," ");if(!val)return feedback(fb,"Type a word first.",false);if(val===task.prep){locked=true;input.disabled=true;input.className="good";registerCorrect();feedback(fb,task.sentence,true);$("continue").disabled=false}else{input.className="bad";registerWrong();feedback(fb,"Try again. Listen carefully.",false);input.select()}};$("clear").onclick=()=>{if(locked)return;input.value="";input.className="";fb.className="feedback";input.focus()};$("continue").onclick=nextRound;input.focus();
}
function finishMission(){
 const m=state.mission,p=state.progress[m.id],earned=calcStars(state.correct),old=p.stars||0;p.done=true;p.stars=Math.max(old,earned);p.best=Math.max(p.best||0,state.score);save();const added=p.stars-old,tot=totalStars();renderHome();$("resultKicker").textContent=`MISSION ${m.num} COMPLETE`;$("resultTitle").textContent=m.title;$("resultStars").textContent=starString(earned);$("resultMessage").textContent=added>0?`Great! You added ${added} new part${added===1?"":"s"} to the cosmic home.`:"Mission saved. Replay it to earn more stars.";$("resultCorrect").textContent=`${state.correct} / 8`;$("resultScore").textContent=state.score;$("resultMissionStars").textContent=`${earned} / 3`;$("resultTotalStars").textContent=`${tot} / 9`;$("resultHouse").src=trackerSrc();$("resultBuildText").textContent=stage()===9?"The cosmic home is complete!":`${stage()} of 9 parts are now visible.`;const next=MISSIONS.find(x=>x.num===m.num+1);$("nextBtn").disabled=!next||!isUnlocked(next.id);audio("win",.9);show("result")
}

$("startBtn").onclick=startMission;$("setupBackBtn").onclick=()=>show("home");$("homeBtn").onclick=()=>{renderHome();show("home")};$("resultMapBtn").onclick=()=>{renderHome();show("home")};$("againBtn").onclick=startMission;$("nextBtn").onclick=()=>{const n=MISSIONS.find(x=>x.num===state.mission.num+1);if(n&&isUnlocked(n.id))openSetup(n.id)};
$("soundsBtn").onclick=()=>{state.sounds=!state.sounds;$("soundsBtn").textContent=state.sounds?"🔊 Sounds":"🔇 Sounds";$("soundsBtn").setAttribute("aria-pressed",String(state.sounds));if(state.sounds)audio("button",.4)};
$("resetBtn").onclick=()=>{if(confirm("Reset all saved progress?")){state.progress=blankProgress();save();renderHome();show("home")}};
renderHome();show("home");
})();
