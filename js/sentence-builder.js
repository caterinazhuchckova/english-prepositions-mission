(() => {
"use strict";
window.renderSentenceBuilder = function(task){
  const {state,IMAGE,sound,registerCorrect,registerWrong,nextRound}=window.GameApp;
  const area=document.getElementById("gameArea");
  const pieces=[
    {text:task.subject,audio:"the_cat.mp3",key:"subject"},
    {text:task.verb,audio:"is.mp3",key:"verb"},
    {text:task.preposition,audio:task.preposition.replaceAll(" ","_")+".mp3",key:"preposition"},
    {text:task.object,audio:task.objectAudio,key:"object"}
  ];
  const shuffled=window.GameApp.shuffle(pieces);
  let answer=[], attempts=0, locked=false;

  area.innerHTML=`
    <img class="task-image" src="${IMAGE+task.image}" alt="${task.sentence}">
    <p class="instruction">Tap the sentence parts in the correct order.</p>
    <div class="sentence-slots" id="sentenceSlots" aria-label="Your sentence"></div>
    <div class="word-bank" id="wordBank" aria-label="Available sentence parts"></div>
    <p class="feedback" id="feedback"></p>
    <div class="game-controls">
      <button class="primary-btn" id="checkSentenceBtn">Check</button>
      <button class="secondary-btn" id="clearSentenceBtn">Clear</button>
      <button class="ghost-btn hidden" id="nextSentenceBtn">Next</button>
    </div>`;
  const slots=area.querySelector("#sentenceSlots"), bank=area.querySelector("#wordBank"), feedback=area.querySelector("#feedback");

  function draw(){
    slots.innerHTML=""; bank.innerHTML="";
    answer.forEach((p,i)=>slots.append(tile(p,()=>{if(locked)return;answer.splice(i,1);sound("block_connect.mp3",.5);draw();})));
    shuffled.filter(p=>!answer.includes(p)).forEach(p=>bank.append(tile(p,()=>{if(locked)return;answer.push(p);if(p.audio)sound(p.audio);setTimeout(()=>sound("block_connect.mp3",.5),100);draw();})));
  }
  function tile(p,handler){const b=document.createElement("button");b.className="word-tile";b.textContent=p.text;b.addEventListener("click",handler);return b;}
  function clear(){if(locked)return;answer=[];feedback.textContent="";feedback.className="feedback";sound("button.mp3",.5);draw();}
  function check(){
    if(locked)return;
    sound("button.mp3",.5);
    if(answer.length<4){feedback.textContent="Choose all four parts.";feedback.className="feedback wrong";return;}
    attempts++;
    const ok=answer.map(p=>p.key).join("|")==="subject|verb|preposition|object";
    if(ok){
      locked=true;feedback.textContent=task.sentence;feedback.className="feedback correct";registerCorrect(attempts===1);
      area.querySelector("#nextSentenceBtn").classList.remove("hidden");
    }else{
      feedback.textContent="Try again.";feedback.className="feedback wrong";registerWrong(false);
      slots.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:300});
    }
  }
  area.querySelector("#checkSentenceBtn").addEventListener("click",check);
  area.querySelector("#clearSentenceBtn").addEventListener("click",clear);
  area.querySelector("#nextSentenceBtn").addEventListener("click",nextRound);
  draw();
};
})();
