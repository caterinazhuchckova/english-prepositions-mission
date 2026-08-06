(() => {
"use strict";

const IMAGE = "assets/images/";
const SOUND = "assets/sounds/";
const MISSION_ORDER = ["sentence", "shooter", "typing"];
const PROGRESS_KEY = "epg_mission_progress_v2";

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

const missionInfo = {
  sentence:{
    number:1,
    title:"Sentence Builder",
    mission:"Repair the Sentence Console",
    description:"Build correct sentences to restore the language console.",
    reward:"Earn up to 3 stars and unlock the Sentence Star badge.",
    badge:"Sentence Star",
    badgeIcon:"🧩"
  },
  shooter:{
    number:2,
    title:"Picture Shooter",
    mission:"Restore the Location Map",
    description:"Read the full phrase and hit the picture that shows the correct location.",
    reward:"Earn up to 3 stars and unlock the Picture Hunter badge.",
    badge:"Picture Hunter",
    badgeIcon:"🎯"
  },
  typing:{
    number:3,
    title:"Type the Preposition",
    mission:"Enter the Secret Words",
    description:"Listen, look and type the missing preposition to complete the flight.",
    reward:"Earn up to 3 stars and unlock the Preposition Master badge.",
    badge:"Preposition Master",
    badgeIcon:"🚀"
  }
};

const rules = {
  sentence:{
    title:"Sentence Builder",
    html:`<p><strong>Mission:</strong> repair the sentence console.</p><ol><li>Look at the picture.</li><li>Tap the word tiles in the correct order.</li><li>Tap <strong>Check</strong>.</li><li>Build a correct-answer streak to increase your combo.</li></ol><p>Example: <strong>The cat | is | under | the table</strong></p>`
  },
  shooter:{
    title:"Picture Shooter",
    html:`<p><strong>Mission:</strong> restore the location map.</p><ol><li>Read the full phrase at the top, for example <strong>under the table</strong>.</li><li>Look at all pictures.</li><li>Tap the correct picture to fire a safe light beam.</li><li>Keep your lives and build a combo.</li></ol>`
  },
  typing:{
    title:"Type the Preposition",
    html:`<p><strong>Mission:</strong> enter the secret words.</p><ol><li>Look at the picture.</li><li>Read the sentence with the missing word.</li><li>On Easy and Medium, listen to the preposition.</li><li>Type the correct preposition and tap <strong>Check</strong>.</li></ol><p>Capital letters are not required. Correct answers in a row increase your combo.</p>`
  }
};

function blankProgress(){
  return {
    completed:{sentence:false, shooter:false, typing:false},
    stars:{sentence:0, shooter:0, typing:0},
    bestCombo:{sentence:0, shooter:0, typing:0},
    teacherUnlock:false
  };
}

function loadProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
    const base=blankProgress();
    if(!saved) return base;
    return {
      completed:{...base.completed,...saved.completed},
      stars:{...base.stars,...saved.stars},
      bestCombo:{...base.bestCombo,...saved.bestCombo},
      teacherUnlock:Boolean(saved.teacherUnlock)
    };
  }catch(error){
    return blankProgress();
  }
}

const state = {
  screen:"home",
  selectedGame:null,
  difficulty:"easy",
  speed:"slow",
  score:0,
  correct:0,
  mistakes:0,
  lives:3,
  round:0,
  tasks:[],
  timer:null,
  timeLeft:30,
  paused:false,
  running:false,
  totalRounds:8,
  combo:0,
  bestCombo:0,
  missionPassed:false,
  progress:loadProgress(),
  musicEnabled:localStorage.getItem("epg_music") !== "false",
  soundsEnabled:localStorage.getItem("epg_sounds") !== "false"
};

const el = id => document.getElementById(id);
const screens = [...document.querySelectorAll(".screen")];
const audioCache = new Map();
let bgMusic;

function saveProgress(){
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
}

function totalStars(){
  return MISSION_ORDER.reduce((sum,game)=>sum + Number(state.progress.stars[game] || 0),0);
}

function completedCount(){
  return MISSION_ORDER.filter(game=>state.progress.completed[game]).length;
}

function isMissionUnlocked(game){
  if(state.progress.teacherUnlock || game==="sentence") return true;
  const index=MISSION_ORDER.indexOf(game);
  return index>0 && state.progress.completed[MISSION_ORDER[index-1]];
}

function renderMissionMap(){
  const completed=completedCount();
  const stars=totalStars();

  el("completedMissions").textContent=`${completed} / 3`;
  el("totalStars").textContent=`${stars} / 9`;
  el("totalBadges").textContent=`${completed} / 3`;
  el("progressFill").style.width=`${(completed/3)*100}%`;

  if(completed===3){
    el("progressMessage").textContent="All missions are complete. Replay them to collect all 9 stars!";
    el("masterBanner").classList.remove("hidden");
  }else{
    const next=MISSION_ORDER.find(game=>!state.progress.completed[game]);
    el("progressMessage").textContent=`Next objective: Mission ${missionInfo[next].number} — ${missionInfo[next].mission}.`;
    el("masterBanner").classList.add("hidden");
  }

  el("teacherUnlockBtn").textContent=state.progress.teacherUnlock
    ? "🔓 Teacher mode: all missions unlocked"
    : "🔓 Teacher mode: unlock all";
  el("teacherUnlockBtn").setAttribute("aria-pressed",String(state.progress.teacherUnlock));

  MISSION_ORDER.forEach(game=>{
    const unlocked=isMissionUnlocked(game);
    const completedMission=state.progress.completed[game];
    const starsEarned=Number(state.progress.stars[game] || 0);
    const card=document.querySelector(`[data-mission-card="${game}"]`);
    const playButton=document.querySelector(`[data-open-game="${game}"]`);
    const lock=document.querySelector(`[data-lock="${game}"]`);
    const starNode=document.querySelector(`[data-stars="${game}"]`);
    const badge=document.querySelector(`[data-badge="${game}"]`);

    card.classList.toggle("locked",!unlocked);
    card.classList.toggle("completed",completedMission);
    lock.classList.toggle("hidden",unlocked);
    playButton.disabled=!unlocked;
    playButton.textContent=completedMission ? "Replay mission" : (unlocked ? "Start mission" : "Locked");
    starNode.textContent="★".repeat(starsEarned)+"☆".repeat(3-starsEarned);
    starNode.setAttribute("aria-label",`${starsEarned} of 3 stars`);
    badge.classList.toggle("unlocked",completedMission);
  });
}

function showScreen(id){
  screens.forEach(screen=>screen.classList.toggle("active",screen.id===id));
  state.screen=id;
  const inMission=["setupScreen","gameScreen","resultScreen"].includes(id);
  el("homeBtn").classList.toggle("hidden",!inMission);
  el("rulesBtn").classList.toggle("hidden",!state.selectedGame || id==="homeScreen");
  if(id==="homeScreen") renderMissionMap();
  window.scrollTo({top:0,behavior:"smooth"});
}

function sound(name,volume=1){
  if(!state.soundsEnabled) return Promise.resolve();
  let audio=audioCache.get(name);
  if(!audio){
    audio=new Audio(SOUND+name);
    audio.preload="auto";
    audioCache.set(name,audio);
  }
  try{
    audio.pause();
    audio.currentTime=0;
    audio.volume=volume;
    return audio.play().catch(()=>{});
  }catch(error){
    return Promise.resolve();
  }
}

function ensureMusic(){
  if(!bgMusic){
    bgMusic=new Audio(SOUND+"background.mp3");
    bgMusic.loop=true;
    bgMusic.volume=.20;
    bgMusic.preload="auto";
  }
  if(state.musicEnabled) bgMusic.play().catch(()=>{});
}

function setMusic(enabled){
  state.musicEnabled=enabled;
  localStorage.setItem("epg_music",String(enabled));
  el("musicBtn").setAttribute("aria-pressed",String(enabled));
  if(enabled) ensureMusic();
  else if(bgMusic) bgMusic.pause();
}

function setSounds(enabled){
  state.soundsEnabled=enabled;
  localStorage.setItem("epg_sounds",String(enabled));
  el("soundsBtn").setAttribute("aria-pressed",String(enabled));
}

function clickSound(){
  sound("button.mp3",.55);
  ensureMusic();
}

function shuffle(array){
  return [...array].sort(()=>Math.random()-.5);
}

function toast(message){
  const node=el("toast");
  node.textContent=message;
  node.classList.add("show");
  clearTimeout(node._timeout);
  node._timeout=setTimeout(()=>node.classList.remove("show"),2200);
}

function showComboBanner(bonus){
  if(state.combo<2) return;
  const node=el("comboBanner");
  node.textContent=`COMBO ×${state.combo} · +${bonus} BONUS`;
  node.classList.remove("hidden");
  node.classList.remove("combo-pop");
  void node.offsetWidth;
  node.classList.add("combo-pop");
  clearTimeout(node._timeout);
  node._timeout=setTimeout(()=>node.classList.add("hidden"),1100);
}

function selectedRadio(name){
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function openRules(game=state.selectedGame){
  const rule=rules[game];
  if(!rule) return;
  el("rulesTitle").textContent=rule.title+" — How to play";
  el("rulesContent").innerHTML=rule.html;
  el("rulesDialog").showModal();
}

function closeRules(){
  el("rulesDialog").close();
}

function openSetup(game){
  if(!isMissionUnlocked(game)){
    toast("Complete the previous mission first.");
    return;
  }

  clickSound();
  state.selectedGame=game;
  const info=missionInfo[game];

  el("setupMissionLabel").textContent=`MISSION ${info.number} · LEVEL A1`;
  el("setupTitle").textContent=info.title;
  el("setupDescription").textContent=info.description;
  el("setupMissionText").textContent=info.mission;
  el("setupReward").textContent=info.reward;

  showScreen("setupScreen");
}

function startGame(){
  clickSound();

  state.difficulty=selectedRadio("difficulty");
  state.speed=selectedRadio("speed");
  state.score=0;
  state.correct=0;
  state.mistakes=0;
  state.lives=3;
  state.round=0;
  state.combo=0;
  state.bestCombo=0;
  state.missionPassed=false;

  state.tasks=shuffle(
    window.GAME_TASKS.filter(task=>state.selectedGame!=="sentence" || task.id!=="between")
  );
  state.totalRounds=state.tasks.length;
  state.running=true;
  state.paused=false;

  const info=missionInfo[state.selectedGame];
  el("gameTitle").textContent=info.title;
  el("gameMissionBadge").textContent=`MISSION ${info.number} · A1`;
  el("comboBanner").classList.add("hidden");

  showScreen("gameScreen");
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
      stopTimer();
      state.mistakes++;
      state.lives--;
      state.combo=0;
      sound("wrong.mp3");
      setTimeout(()=>sound("try_again.mp3"),180);
      updateStats();

      if(state.lives<=0) endGame();
      else setTimeout(nextRound,850);
    }
  },1000);
}

function stopTimer(){
  if(state.timer){
    clearInterval(state.timer);
    state.timer=null;
  }
}

function updateStats(){
  el("scoreValue").textContent=state.score;
  el("roundValue").textContent=`${Math.min(state.round+1,state.totalRounds)} / ${state.totalRounds}`;
  el("livesValue").textContent="♥ ".repeat(Math.max(0,state.lives)).trim() || "—";
  el("comboValue").textContent=`×${state.combo}`;
  el("comboValue").classList.toggle("combo-active",state.combo>=2);
}

function loadRound(){
  if(state.round>=state.totalRounds || state.lives<=0){
    endGame();
    return;
  }

  updateStats();
  startTimer();

  const task=state.tasks[state.round];
  const renderers={
    sentence:window.renderSentenceBuilder,
    shooter:window.renderPictureShooter,
    typing:window.renderTypePreposition
  };
  renderers[state.selectedGame](task);
}

function registerCorrect(firstTry=true){
  stopTimer();

  state.correct++;
  state.combo++;
  state.bestCombo=Math.max(state.bestCombo,state.combo);

  const base=firstTry ? 10 : 7;
  const timeBonus=state.timeLeft ? Math.min(5,Math.floor(state.timeLeft/6)) : 0;
  const comboBonus=state.combo>=2 ? Math.min(10,(state.combo-1)*2) : 0;

  state.score+=base+timeBonus+comboBonus;
  updateStats();

  if(comboBonus) showComboBanner(comboBonus);

  sound("correct.mp3");
  setTimeout(()=>sound(Math.random()>.5 ? "great_job.mp3" : "excellent.mp3"),170);
  setTimeout(()=>sound("meow.mp3",.75),430);
}

function registerWrong(loseLife=true){
  state.mistakes++;
  state.combo=0;

  if(loseLife && state.difficulty!=="easy") state.lives--;

  updateStats();
  sound("wrong.mp3");
  setTimeout(()=>sound("try_again.mp3"),170);

  if(state.lives<=0){
    stopTimer();
    setTimeout(endGame,700);
  }
}

function nextRound(){
  stopTimer();
  state.round++;
  loadRound();
}

function bestKey(){
  return `epg_best_${state.selectedGame}`;
}

function starsForResult(){
  const ratio=state.totalRounds ? state.correct/state.totalRounds : 0;
  if(ratio>=.9) return 3;
  if(ratio>=.7) return 2;
  if(ratio>=.6) return 1;
  return 0;
}

function endGame(){
  stopTimer();
  state.running=false;

  const info=missionInfo[state.selectedGame];
  const stars=starsForResult();
  const required=Math.ceil(state.totalRounds*.6);
  state.missionPassed=state.correct>=required;

  const oldBest=Number(localStorage.getItem(bestKey()) || 0);
  const best=Math.max(oldBest,state.score);
  localStorage.setItem(bestKey(),String(best));

  const firstCompletion=!state.progress.completed[state.selectedGame];

  if(state.missionPassed){
    state.progress.completed[state.selectedGame]=true;
    state.progress.stars[state.selectedGame]=Math.max(
      Number(state.progress.stars[state.selectedGame] || 0),
      stars
    );
    state.progress.bestCombo[state.selectedGame]=Math.max(
      Number(state.progress.bestCombo[state.selectedGame] || 0),
      state.bestCombo
    );
    saveProgress();
  }

  showScreen("resultScreen");

  el("resultMissionLabel").textContent=state.missionPassed
    ? `MISSION ${info.number} COMPLETED`
    : `MISSION ${info.number} — TRY AGAIN`;

  el("resultTitle").textContent=completedCount()===3 && state.missionPassed
    ? "All missions completed!"
    : (state.missionPassed ? "Mission completed!" : "Mission needs another try!");

  el("resultMessage").textContent=state.missionPassed
    ? (completedCount()===3
        ? "You are a Preposition Master! Replay missions to collect all 9 stars."
        : `${info.badge} unlocked. The next mission is now available.`)
    : `Get at least ${required} correct answers to complete this mission.`;

  el("resultScore").textContent=state.score;
  el("resultCorrect").textContent=`${state.correct} / ${state.totalRounds}`;
  el("resultMistakes").textContent=state.mistakes;
  el("resultBest").textContent=best;
  el("resultCombo").textContent=`×${state.bestCombo}`;
  el("resultTotalStars").textContent=`${totalStars()} / 9`;
  el("resultStars").textContent=stars
    ? "★".repeat(stars)+"☆".repeat(3-stars)
    : "☆☆☆";

  const badgeBox=el("badgeUnlocked");
  if(state.missionPassed && firstCompletion){
    badgeBox.classList.remove("hidden");
    el("badgeUnlockedIcon").textContent=info.badgeIcon;
    el("badgeUnlockedName").textContent=info.badge;
  }else{
    badgeBox.classList.add("hidden");
  }

  const currentIndex=MISSION_ORDER.indexOf(state.selectedGame);
  if(!state.missionPassed){
    el("nextGameBtn").classList.add("hidden");
  }else if(currentIndex===MISSION_ORDER.length-1){
    el("nextGameBtn").classList.remove("hidden");
    el("nextGameBtn").textContent="Mission map";
  }else{
    el("nextGameBtn").classList.remove("hidden");
    el("nextGameBtn").textContent="Next mission";
  }

  if(state.missionPassed){
    sound("win.mp3");
    setTimeout(()=>sound("completed.mp3"),250);
  }else{
    sound("wrong.mp3");
  }
}

function requestMenu(){
  clickSound();
  if(state.screen==="gameScreen" && state.running){
    state.paused=true;
    stopTimer();
    el("confirmDialog").showModal();
  }else{
    goHome();
  }
}

function goHome(){
  stopTimer();
  state.running=false;
  state.paused=false;
  state.selectedGame=null;

  ["confirmDialog","pauseDialog"].forEach(id=>{
    const dialog=el(id);
    if(dialog.open) dialog.close();
  });

  showScreen("homeScreen");
}

function pauseGame(){
  clickSound();
  if(!state.running) return;
  state.paused=true;
  stopTimer();
  el("pauseDialog").showModal();
}

function resumeGame(){
  clickSound();
  el("pauseDialog").close();
  state.paused=false;
  startTimer();
}

function restartGame(){
  clickSound();
  startGame();
}

function nextGame(){
  if(!state.missionPassed){
    startGame();
    return;
  }

  const index=MISSION_ORDER.indexOf(state.selectedGame);
  if(index>=MISSION_ORDER.length-1){
    goHome();
    return;
  }

  openSetup(MISSION_ORDER[index+1]);
}

function toggleTeacherUnlock(){
  clickSound();
  state.progress.teacherUnlock=!state.progress.teacherUnlock;
  saveProgress();
  renderMissionMap();
  toast(state.progress.teacherUnlock
    ? "Teacher mode: all missions are open."
    : "Teacher mode switched off.");
}

function resetProgress(){
  const confirmed=window.confirm("Reset mission stars, badges and unlocked missions?");
  if(!confirmed) return;

  state.progress=blankProgress();
  saveProgress();
  renderMissionMap();
  toast("Mission progress reset.");
}

window.GameApp={
  state,
  IMAGE,
  SOUND,
  sound,
  shuffle,
  toast,
  registerCorrect,
  registerWrong,
  nextRound,
  endGame
};

document.querySelectorAll("[data-open-game]").forEach(button=>{
  button.addEventListener("click",()=>openSetup(button.dataset.openGame));
});

document.querySelectorAll("[data-open-rules]").forEach(button=>{
  button.addEventListener("click",()=>{
    clickSound();
    openRules(button.dataset.openRules);
  });
});

el("startGameBtn").addEventListener("click",startGame);
el("setupRulesBtn").addEventListener("click",()=>{clickSound();openRules();});
el("rulesBtn").addEventListener("click",()=>{clickSound();openRules();});
el("closeRulesBtn").addEventListener("click",closeRules);
el("gotItBtn").addEventListener("click",closeRules);

el("setupMenuBtn").addEventListener("click",goHome);
el("homeBtn").addEventListener("click",requestMenu);
el("gameMenuBtn").addEventListener("click",requestMenu);
el("resultMenuBtn").addEventListener("click",goHome);

el("musicBtn").addEventListener("click",()=>{
  clickSound();
  setMusic(!state.musicEnabled);
});

el("soundsBtn").addEventListener("click",()=>{
  setSounds(!state.soundsEnabled);
  if(state.soundsEnabled) sound("button.mp3");
});

el("pauseBtn").addEventListener("click",pauseGame);
el("resumeBtn").addEventListener("click",resumeGame);
el("pauseMenuBtn").addEventListener("click",()=>{
  el("pauseDialog").close();
  goHome();
});

el("restartBtn").addEventListener("click",restartGame);
el("playAgainBtn").addEventListener("click",startGame);
el("nextGameBtn").addEventListener("click",nextGame);

el("confirmExitBtn").addEventListener("click",goHome);
el("cancelExitBtn").addEventListener("click",()=>{
  el("confirmDialog").close();
  state.paused=false;
  startTimer();
});

el("teacherUnlockBtn").addEventListener("click",toggleTeacherUnlock);
el("resetProgressBtn").addEventListener("click",resetProgress);

el("rulesDialog").addEventListener("click",event=>{
  if(event.target===el("rulesDialog")) closeRules();
});

el("musicBtn").setAttribute("aria-pressed",String(state.musicEnabled));
el("soundsBtn").setAttribute("aria-pressed",String(state.soundsEnabled));
renderMissionMap();
})();
