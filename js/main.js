(() => {
"use strict";

const IMAGE = "assets/images/";
const SOUND = "assets/sounds/";

window.GAME_TASKS = [
  {id:"in_box", image:"cat_in_box.png", subject:"The cat", verb:"is", preposition:"in", object:"the box", sentence:"The cat is in the box.", objectAudio:"the_box.mp3"},
  {id:"on_box", image:"cat_on_box.png", subject:"The cat", verb:"is", preposition:"on", object:"the box", sentence:"The cat is on the box.", objectAudio:"the_box.mp3"},
  {id:"under_table", image:"cat_under_table.png", subject:"The cat", verb:"is", preposition:"under", object:"the table", sentence:"The cat is under the table.", objectAudio:"the_table.mp3"},
  {id:"behind_chair", image:"cat_behind_chair.png", subject:"The cat", verb:"is", preposition:"behind", object:"the chair", sentence:"The cat is behind the chair.", objectAudio:"the_chair.mp3"},
  {id:"front_box", image:"cat_in_front_of_box.png", subject:"The cat", verb:"is", preposition:"in front of", object:"the box", sentence:"The cat is in front of the box.", objectAudio:"the_box.mp3"},
  {id:"next_sofa", image:"cat_next_to_sofa.png", subject:"The cat", verb:"is", preposition:"next to", object:"the sofa", sentence:"The cat is next to the sofa.", objectAudio:"the_sofa.mp3"},
  {id:"between", image:"cat_between_table_and_box.png", subject:"The cat", verb:"is", preposition:"between", object:"the table and the box", sentence:"The cat is between the table and the box.", objectAudio:null},
  {id:"near_lamp", image:"cat_near_lamp.png", subject:"The cat", verb:"is", preposition:"near", object:"the lamp", sentence:"The cat is near the lamp.", objectAudio:"the_lamp.mp3"}
];

const rules = {
  sentence: {
    title:"Sentence Builder",
    html:`<p>Build the sentence from four parts.</p><ol><li>Look at the picture.</li><li>Tap the word tiles in the correct order.</li><li>Tap <strong>Check</strong>.</li><li>Tap a selected tile to return it to the word bank.</li></ol><p>Example: <strong>The cat | is | under | the table</strong></p>`
  },
  shooter: {
    title:"Picture Shooter",
    html:`<p>Choose the picture that matches the preposition.</p><ol><li>Read the word at the top.</li><li>Look at all pictures.</li><li>Tap the correct picture to fire a safe light beam.</li><li>Try to keep all three lives.</li></ol>`
  },
  typing: {
    title:"Type the Preposition",
    html:`<p>Type the missing preposition.</p><ol><li>Look at the picture.</li><li>Read the sentence with the missing word.</li><li>Type the correct preposition.</li><li>Tap <strong>Check</strong>.</li></ol><p>Capital letters are not required.</p>`
  }
};

const names = {
  sentence:"Sentence Builder",
  shooter:"Picture Shooter",
  typing:"Type the Preposition"
};
const descriptions = {
  sentence:"Look at the picture and put the sentence parts in the correct order.",
  shooter:"Read the preposition and shoot the correct picture.",
  typing:"Look at the picture and type the missing preposition."
};

const state = {
  screen:"home", selectedGame:null, difficulty:"easy", speed:"slow",
  score:0, correct:0, mistakes:0, lives:3, round:0, tasks:[],
  timer:null, timeLeft:30, paused:false, running:false,
  musicEnabled: localStorage.getItem("epg_music") !== "false",
  soundsEnabled: localStorage.getItem("epg_sounds") !== "false"
};

const el = id => document.getElementById(id);
const screens = [...document.querySelectorAll(".screen")];
const audioCache = new Map();
let bgMusic;

function showScreen(id){
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  state.screen = id;
  const inGame = ["setupScreen","gameScreen","resultScreen"].includes(id);
  el("homeBtn").classList.toggle("hidden", !inGame);
  el("rulesBtn").classList.toggle("hidden", !state.selectedGame || id === "homeScreen");
  window.scrollTo({top:0, behavior:"smooth"});
}
function sound(name, volume=1){
  if(!state.soundsEnabled) return Promise.resolve();
  let a = audioCache.get(name);
  if(!a){ a = new Audio(SOUND + name); a.preload="auto"; audioCache.set(name,a); }
  try{ a.pause(); a.currentTime=0; a.volume=volume; return a.play().catch(()=>{}); }catch(e){ return Promise.resolve(); }
}
function ensureMusic(){
  if(!bgMusic){
    bgMusic = new Audio(SOUND+"background.mp3");
    bgMusic.loop = true; bgMusic.volume=.20; bgMusic.preload="auto";
  }
  if(state.musicEnabled) bgMusic.play().catch(()=>{});
}
function setMusic(enabled){
  state.musicEnabled=enabled; localStorage.setItem("epg_music", String(enabled));
  el("musicBtn").setAttribute("aria-pressed", String(enabled));
  if(enabled) ensureMusic(); else if(bgMusic) bgMusic.pause();
}
function setSounds(enabled){
  state.soundsEnabled=enabled; localStorage.setItem("epg_sounds", String(enabled));
  el("soundsBtn").setAttribute("aria-pressed", String(enabled));
}
function clickSound(){ sound("button.mp3",.55); ensureMusic(); }
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function toast(message){ const t=el("toast"); t.textContent=message; t.classList.add("show"); clearTimeout(t._to); t._to=setTimeout(()=>t.classList.remove("show"),2200); }
function selectedRadio(name){ return document.querySelector(`input[name="${name}"]:checked`).value; }
function openRules(game=state.selectedGame){
  const r=rules[game]; if(!r) return;
  el("rulesTitle").textContent=r.title+" — How to play";
  el("rulesContent").innerHTML=r.html;
  el("rulesDialog").showModal();
}
function closeRules(){ el("rulesDialog").close(); }
function openSetup(game){
  clickSound(); state.selectedGame=game;
  el("setupTitle").textContent=names[game];
  el("setupDescription").textContent=descriptions[game];
  showScreen("setupScreen");
}
function startGame(){
  clickSound();
  state.difficulty=selectedRadio("difficulty");
  state.speed=selectedRadio("speed");
  state.score=0; state.correct=0; state.mistakes=0; state.lives=3; state.round=0;
  state.tasks=shuffle(GAME_TASKS);
  state.running=true; state.paused=false;
  showScreen("gameScreen");
  el("gameTitle").textContent=names[state.selectedGame];
  updateStats();
  loadRound();
}
function timeForSpeed(){
  if(state.difficulty==="easy" && state.speed==="slow") return 0;
  return {slow:30,normal:20,fast:12}[state.speed] || 20;
}
function startTimer(){
  stopTimer();
  state.timeLeft=timeForSpeed();
  el("timeValue").textContent=state.timeLeft || "∞";
  if(!state.timeLeft) return;
  state.timer=setInterval(()=>{
    if(state.paused) return;
    state.timeLeft--;
    el("timeValue").textContent=state.timeLeft;
    if(state.timeLeft===5) sound("timer.mp3",.65);
    if(state.timeLeft<=0){
      stopTimer(); state.mistakes++; state.lives--;
      sound("wrong.mp3"); setTimeout(()=>sound("try_again.mp3"),180);
      updateStats();
      if(state.lives<=0) endGame(); else setTimeout(nextRound,850);
    }
  },1000);
}
function stopTimer(){ if(state.timer){clearInterval(state.timer);state.timer=null;} }
function updateStats(){
  el("scoreValue").textContent=state.score;
  el("roundValue").textContent=`${Math.min(state.round+1,8)} / 8`;
  el("livesValue").textContent="♥ ".repeat(Math.max(0,state.lives)).trim() || "—";
}
function loadRound(){
  if(state.round>=8 || state.lives<=0){ endGame(); return; }
  updateStats(); startTimer();
  const task=state.tasks[state.round];
  const renderers={sentence:window.renderSentenceBuilder, shooter:window.renderPictureShooter, typing:window.renderTypePreposition};
  renderers[state.selectedGame](task);
}
function registerCorrect(firstTry=true){
  stopTimer(); state.correct++;
  const base=firstTry?10:7, bonus=state.timeLeft?Math.min(5,Math.floor(state.timeLeft/6)):0;
  state.score += base+bonus; updateStats();
  sound("correct.mp3"); setTimeout(()=>sound(Math.random()>.5?"great_job.mp3":"excellent.mp3"),170); setTimeout(()=>sound("meow.mp3",.75),430);
}
function registerWrong(loseLife=true){
  state.mistakes++; if(loseLife && state.difficulty!=="easy") state.lives--;
  updateStats(); sound("wrong.mp3"); setTimeout(()=>sound("try_again.mp3"),170);
  if(state.lives<=0){ stopTimer(); setTimeout(endGame,700); }
}
function nextRound(){ stopTimer(); state.round++; loadRound(); }
function bestKey(){ return `epg_best_${state.selectedGame}`; }
function endGame(){
  stopTimer(); state.running=false; showScreen("resultScreen");
  const old=Number(localStorage.getItem(bestKey())||0), best=Math.max(old,state.score);
  localStorage.setItem(bestKey(),String(best));
  el("resultScore").textContent=state.score;
  el("resultCorrect").textContent=`${state.correct} / 8`;
  el("resultMistakes").textContent=state.mistakes;
  el("resultBest").textContent=best;
  const pct=state.correct/8, stars=pct>=.9?3:pct>=.7?2:1;
  el("resultStars").textContent="★".repeat(stars)+"☆".repeat(3-stars);
  sound("win.mp3"); setTimeout(()=>sound("completed.mp3"),250);
}
function requestMenu(){
  clickSound();
  if(state.screen==="gameScreen" && state.running){ state.paused=true; stopTimer(); el("confirmDialog").showModal(); }
  else goHome();
}
function goHome(){
  stopTimer(); state.running=false; state.paused=false; state.selectedGame=null;
  ["confirmDialog","pauseDialog"].forEach(id=>{const d=el(id);if(d.open)d.close();});
  showScreen("homeScreen");
}
function pauseGame(){
  clickSound(); if(!state.running)return; state.paused=true; stopTimer(); el("pauseDialog").showModal();
}
function resumeGame(){ clickSound(); el("pauseDialog").close(); state.paused=false; startTimer(); }
function restartGame(){ clickSound(); startGame(); }
function nextGame(){
  const order=["sentence","shooter","typing"], idx=order.indexOf(state.selectedGame);
  openSetup(order[(idx+1)%order.length]);
}

window.GameApp={state,IMAGE,SOUND,sound,shuffle,toast,registerCorrect,registerWrong,nextRound,endGame};

document.querySelectorAll("[data-open-game]").forEach(b=>b.addEventListener("click",()=>openSetup(b.dataset.openGame)));
document.querySelectorAll("[data-open-rules]").forEach(b=>b.addEventListener("click",()=>{clickSound();openRules(b.dataset.openRules);}));
el("startGameBtn").addEventListener("click",startGame);
el("setupRulesBtn").addEventListener("click",()=>{clickSound();openRules();});
el("rulesBtn").addEventListener("click",()=>{clickSound();openRules();});
el("closeRulesBtn").addEventListener("click",closeRules);el("gotItBtn").addEventListener("click",closeRules);
el("setupMenuBtn").addEventListener("click",goHome);el("homeBtn").addEventListener("click",requestMenu);el("gameMenuBtn").addEventListener("click",requestMenu);el("resultMenuBtn").addEventListener("click",goHome);
el("musicBtn").addEventListener("click",()=>{clickSound();setMusic(!state.musicEnabled);});
el("soundsBtn").addEventListener("click",()=>{setSounds(!state.soundsEnabled);if(state.soundsEnabled)sound("button.mp3");});
el("pauseBtn").addEventListener("click",pauseGame);el("resumeBtn").addEventListener("click",resumeGame);el("pauseMenuBtn").addEventListener("click",()=>{el("pauseDialog").close();goHome();});
el("restartBtn").addEventListener("click",restartGame);el("playAgainBtn").addEventListener("click",startGame);el("nextGameBtn").addEventListener("click",nextGame);
el("confirmExitBtn").addEventListener("click",goHome);el("cancelExitBtn").addEventListener("click",()=>{el("confirmDialog").close();state.paused=false;startTimer();});
el("rulesDialog").addEventListener("click",e=>{if(e.target===el("rulesDialog"))closeRules();});
el("musicBtn").setAttribute("aria-pressed",String(state.musicEnabled));el("soundsBtn").setAttribute("aria-pressed",String(state.soundsEnabled));
})();
