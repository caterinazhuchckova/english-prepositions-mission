(() => {
"use strict";
window.renderPictureShooter = function(task){
  const {state,IMAGE,sound,shuffle,registerCorrect,registerWrong,nextRound}=window.GameApp;
  const area=document.getElementById("gameArea");
  const count={easy:3,medium:4,hard:6}[state.difficulty];
  const distractors=shuffle(window.GAME_TASKS.filter(t=>t.id!==task.id)).slice(0,count-1);
  const options=shuffle([task,...distractors]);
  let locked=false;

  area.innerHTML=`
    <h2 class="shooter-prompt">${task.preposition}</h2>
    <p class="instruction">Choose the correct picture.</p>
    <div class="shooter-grid" id="shooterGrid"></div>
    <p class="feedback" id="feedback"></p>`;
  const grid=area.querySelector("#shooterGrid"), feedback=area.querySelector("#feedback");
  options.forEach(opt=>{
    const b=document.createElement("button");b.className="shooter-option";b.setAttribute("aria-label",opt.sentence);
    b.innerHTML=`<img src="${IMAGE+opt.image}" alt="${opt.sentence}">`;
    b.addEventListener("click",()=>shoot(b,opt));
    grid.append(b);
  });
  function shoot(button,opt){
    if(locked)return;
    sound("shot.mp3",.65);
    const ok=opt.id===task.id;
    if(ok){
      locked=true;button.classList.add("hit");feedback.textContent="Great job!";feedback.className="feedback correct";
      setTimeout(()=>sound("hit.mp3"),100);registerCorrect(true);setTimeout(nextRound,950);
    }else{
      button.classList.add("miss");setTimeout(()=>button.classList.remove("miss"),450);
      feedback.textContent="Try again.";feedback.className="feedback wrong";registerWrong(true);
    }
  }
};
})();
