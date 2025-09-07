/* =========================================================
   CONNECTED WEB OF DOTS BACKGROUND (slow)
   ========================================================= */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d", { alpha: true });

let DPR = Math.min(2, window.devicePixelRatio || 1);
let W, H;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width  = Math.floor(innerWidth  * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width  = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
}
addEventListener("resize", resize, { passive: true });
resize();

const COUNT = Math.floor((innerWidth * innerHeight) / 23000) + 40;
const SPEED = 0.08;
const LINK_DIST = 160 * DPR;
const MOUSE_PUSH = 90 * DPR;

const nodes = [];
function rand(min, max){ return Math.random() * (max - min) + min; }

for (let i = 0; i < COUNT; i++){
  nodes.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: rand(-SPEED, SPEED),
    vy: rand(-SPEED, SPEED),
    r: rand(1.2, 2.2) * DPR
  });
}

let mouse = { x: -9999, y: -9999 };
addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * DPR;
  mouse.y = (e.clientY - r.top) * DPR;
});
addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

function animate(){
  ctx.clearRect(0,0,W,H);

  for (const n of nodes){
    n.x += n.vx; n.y += n.vy;

    const dx = n.x - mouse.x;
    const dy = n.y - mouse.y;
    const d2 = dx*dx + dy*dy;
    if (d2 < MOUSE_PUSH*MOUSE_PUSH){
      const d = Math.sqrt(d2) || 1;
      const f = (MOUSE_PUSH - d) / MOUSE_PUSH * 0.15;
      n.vx += (dx / d) * f;
      n.vy += (dy / d) * f;
    }
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
  }

  ctx.lineWidth = 1 * DPR;
  for (let i=0; i<nodes.length; i++){
    const a = nodes[i];
    for (let j=i+1; j<nodes.length; j++){
      const b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < LINK_DIST){
        const alpha = 1 - dist / LINK_DIST;
        ctx.strokeStyle = `rgba(255, 217, 80, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const n of nodes){
    ctx.beginPath();
    ctx.fillStyle = "#FFD950";
    ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 217, 80, .14)";
    ctx.arc(n.x, n.y, n.r*3.5, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* =========================================================
   LEFT BULLETS → SCROLL ONLY THE RIGHT COLUMN
   ========================================================= */
const right = document.getElementById("rightPane");
const navLinks = Array.from(document.querySelectorAll(".bullet-nav .bullet"));
const targets  = navLinks.map(a => document.querySelector(a.getAttribute("href")));

// Smooth scroll inside the right pane (not the whole window)
document.addEventListener("click", (e) => {
  const link = e.target.closest('.bullet-nav .bullet[href^="#"]');
  if (!link) return;
  const el = document.querySelector(link.getAttribute("href"));
  if (!el) return;
  e.preventDefault();
  const OFFSET = 40; // tweak to taste (e.g., 40)
right.scrollTo({ top: Math.max(0, el.offsetTop - OFFSET), behavior: "smooth" });
});

// Highlight current section based on the right pane scroll position
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = "#" + entry.target.id;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
    }
  });
}, {
  root: right,                 // watch within the right scroll container
  rootMargin: "-40% 0% -55% 0%",
  threshold: [0, 1]
});

targets.forEach(el => el && io.observe(el));
