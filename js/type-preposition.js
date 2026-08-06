(() => {
"use strict";

const PREPOSITION_AUDIO = {
  "in":"in.mp3",
  "on":"on.mp3",
  "under":"under.mp3",
  "behind":"behind.mp3",
  "next to":"next_to.mp3",
  "in front of":"in_front_of.mp3",
  "between":"between.mp3",
  "near":"near.mp3"
};

window.renderTypePreposition = function(task){
  const {state,IMAGE,sound,registerCorrect,registerWrong,nextRound}=window.GameApp;
  const area=document.getElementById("gameArea");
  let attempts=0,locked=false;

  const hasListening=state.difficulty==="easy" || state.difficulty==="medium";
  const hint=state.difficulty==="easy"
    ? `<p class="instruction">Hint: the word starts with <strong>${task.preposition[0].toUpperCase()}</strong>.</p>`
    : "";

  const listening=hasListening
    ? `<div class="listen-row">
         <p class="instruction">Listen and type the preposition.</p>
         <button class="secondary-btn listen-btn" id="listenPrepositionBtn" type="button" aria-label="Listen to the preposition">🔊 Listen again</button>
       </div>`
    : "";

  area.innerHTML=`
    <img class="task-image" src="${IMAGE+task.image}" alt="${task.sentence}">
    <p class="type-sentence">The cat is <span aria-label="missing preposition">_____</span> ${task.object}.</p>
    ${listening}
    ${hint}
    <label class="sr-only" for="prepositionInput">Type the missing preposition</label>
    <input id="prepositionInput" class="type-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the preposition">
    <p class="feedback" id="feedback"></p>
    <div class="game-controls">
      <button class="primary-btn" id="checkTypingBtn">Check</button>
      <button class="secondary-btn" id="clearTypingBtn">Clear</button>
      <button class="ghost-btn hidden" id="nextTypingBtn">Next</button>
    </div>`;

  const input=area.querySelector("#prepositionInput");
  const feedback=area.querySelector("#feedback");
  const audioFile=PREPOSITION_AUDIO[task.preposition];

  function playPreposition(){
    if(audioFile) sound(audioFile,.95);
  }

  if(hasListening){
    area.querySelector("#listenPrepositionBtn").addEventListener("click",playPreposition);
    setTimeout(playPreposition,260);
  }

  input.focus();
  input.addEventListener("input",()=>sound("typing.mp3",.35));
  input.addEventListener("keydown",event=>{if(event.key==="Enter")check();});

  function normalize(value){
    return value.trim().toLowerCase().replace(/\s+/g," ");
  }

  function check(){
    if(locked)return;
    sound("button.mp3",.5);
    attempts++;

    if(normalize(input.value)===normalize(task.preposition)){
      locked=true;
      input.classList.remove("wrong");
      input.classList.add("correct");
      input.disabled=true;
      feedback.textContent=task.sentence;
      feedback.className="feedback correct";
      registerCorrect(attempts===1);
      area.querySelector("#nextTypingBtn").classList.remove("hidden");
    }else{
      input.classList.remove("correct");
      input.classList.add("wrong");
      feedback.textContent="Try again.";
      feedback.className="feedback wrong";
      registerWrong(false);
      input.select();
    }
  }

  area.querySelector("#checkTypingBtn").addEventListener("click",check);
  area.querySelector("#clearTypingBtn").addEventListener("click",()=>{
    if(locked)return;
    input.value="";
    input.classList.remove("wrong","correct");
    feedback.textContent="";
    sound("button.mp3",.5);
    input.focus();
  });
  area.querySelector("#nextTypingBtn").addEventListener("click",nextRound);
};
})();
