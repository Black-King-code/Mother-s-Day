function goTo(id){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

/* ---------- Tiny sound effects (Web Audio API, no external files) ---------- */
let audioCtx = null;
function getCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freq, duration, type='sine', delay=0, gainVal=0.14){
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}
// playful "แอ๊ด~" boop for page 1 button
function playBoop(){
  playTone(520, 0.09, 'triangle', 0);
  playTone(780, 0.14, 'triangle', 0.07);
}
// soft click for regular nav buttons
function playClick(){
  playTone(340, 0.08, 'sine', 0);
}
// success chime for fingerprint confirm
function playChime(){
  playTone(660, 0.12, 'sine', 0);
  playTone(880, 0.16, 'sine', 0.09);
  playTone(1100, 0.2, 'sine', 0.18);
}
// mini fanfare for the final reveal
function playTada(){
  [523, 659, 784, 1046].forEach((f,i)=> playTone(f, 0.22, 'triangle', i*0.09, 0.11));
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(btn.closest('#p1')) playBoop(); else playClick();
    });
  });
});

/* ---------- Scroll-triggered entrance animation for each section ---------- */
const revealTargets = document.querySelectorAll(
  '#p1 > *, #p2 .phone-frame, #p3 .dash-wrap, #p4 .letter, #p5 h2, #p5 p, #p5 .heart-btn'
);
revealTargets.forEach(el => el.classList.add('enter'));
const entranceObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('enter-visible');
    }
  });
}, {threshold:0.35});
revealTargets.forEach(el => entranceObserver.observe(el));

// Counter animation for dashboard (runs once page 3 is in view)
let dashDone = false;
const dashObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !dashDone){
      dashDone = true;
      document.querySelectorAll('#dash-body .val').forEach((cell,i)=>{
        const target = cell.getAttribute('data-target');
        let count = 0;
        const isInf = target === 'inf';
        const numericTarget = isInf ? 999 : 100;
        const duration = 900 + i*120;
        const start = performance.now() + i*80;
        function step(now){
          if(now < start){ requestAnimationFrame(step); return; }
          const t = Math.min(1, (now-start)/duration);
          const eased = 1 - Math.pow(1-t, 3);
          count = Math.floor(eased * numericTarget);
          cell.textContent = t >= 1 ? (isInf ? '∞' : target) : count;
          if(t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  });
}, {threshold:0.4});
dashObserver.observe(document.getElementById('p3'));

// Fingerprint gimmick
function showFingerprint(){
  document.getElementById('fp-wrap').classList.add('show');
  playClick();
}
const fpIcon = document.getElementById('fp-icon');
const fpResult = document.getElementById('fp-result');
let holdTimer = null;

function startHold(){
  fpIcon.classList.add('holding');
  fpIcon.textContent = '👆';
  holdTimer = setTimeout(()=>{
    fpIcon.textContent = '✅';
    fpResult.textContent = 'แม่ก็คือแม่อะครับ ❤️';
    playChime();
  }, 1200);
}
function endHold(){
  fpIcon.classList.remove('holding');
  if(holdTimer){ clearTimeout(holdTimer); holdTimer = null; }
  if(fpResult.textContent === ''){
    fpIcon.textContent = '🔒';
  }
}
fpIcon.addEventListener('mousedown', startHold);
fpIcon.addEventListener('touchstart', (e)=>{e.preventDefault(); startHold();}, {passive:false});
['mouseup','mouseleave','touchend','touchcancel'].forEach(ev=>{
  fpIcon.addEventListener(ev, endHold);
});

// Final confetti + reveal
function popConfetti(){
  const reveal = document.getElementById('reveal');
  reveal.classList.add('show');
  playTada();
  const duration = 1600;
  const end = Date.now() + duration;
  (function frame(){
    confetti({particleCount:5, angle:60, spread:65, origin:{x:0}, colors:['#FF5D62','#FFC94A','#FFD9DE','#FFF6EC']});
    confetti({particleCount:5, angle:120, spread:65, origin:{x:1}, colors:['#FF5D62','#FFC94A','#FFD9DE','#FFF6EC']});
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({particleCount:80, spread:100, origin:{y:0.5}, colors:['#FF5D62','#FFC94A','#FFD9DE']});
}
