const gameArea = document.getElementById('gameArea');
const scoreEl = document.getElementById('score');
let score = 0;
let isActive = true;

// Colors for bubbles (pastel)
const colors = [
    'rgba(255, 182, 193, 0.6)',  // Pink
    'rgba(173, 216, 230, 0.6)', // Blue
    'rgba(152, 251, 152, 0.6)', // Green
    'rgba(238, 232, 170, 0.6)', // Yellow
    'rgba(221, 160, 221, 0.6)'  // Plum
];

// Audio Context
const actx = new (window.AudioContext || window.webkitAudioContext)();
function playPop() {
    if (actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.frequency.setValueAtTime(400 + Math.random() * 400, actx.currentTime);
    osc.className = 'sine';
    gain.gain.setValueAtTime(0.1, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(); osc.stop(actx.currentTime + 0.1);
}

function createBubble() {
    if (!isActive) return;

    const b = document.createElement('div');
    b.className = 'bubble';

    // Random Size
    const size = 60 + Math.random() * 60;
    b.style.width = size + 'px';
    b.style.height = size + 'px';

    // Random Pos
    const x = Math.random() * (window.innerWidth - size);
    b.style.left = x + 'px';
    b.style.bottom = -size + 'px'; // Start below screen

    // Styles
    const color = colors[Math.floor(Math.random() * colors.length)];
    b.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${color})`;

    // Click Handler
    b.onpointerdown = (e) => popBubble(b, e);

    gameArea.appendChild(b);

    // Float Animation
    const duration = 4 + Math.random() * 4;
    gsap.to(b, {
        y: -(window.innerHeight + size * 2),
        x: (Math.random() - 0.5) * 100, // Wiggle
        rotation: Math.random() * 360,
        duration: duration,
        ease: 'none',
        onComplete: () => { b.remove(); }
    });
}

function popBubble(el, e) {
    if (el.popped) return;
    el.popped = true;
    playPop();
    score++;
    scoreEl.innerText = score;

    // Pop visual
    gsap.killTweensOf(el);
    gsap.to(el, { scale: 1.4, opacity: 0, duration: 0.15, ease: 'power1.out', onComplete: () => el.remove() });

    // Particles
    spawnParticles(e.clientX, e.clientY);
}

function spawnParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.width = '6px'; p.style.height = '6px';
        p.style.background = 'rgba(255,255,255,0.8)';
        p.style.borderRadius = '50%';
        p.style.left = x + 'px'; p.style.top = y + 'px';
        p.style.pointerEvents = 'none';
        gameArea.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 30;
        gsap.to(p, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            duration: 0.4,
            onComplete: () => p.remove()
        });
    }
}

// Loop
setInterval(createBubble, 800);

// Initial Bubbles
for (let i = 0; i < 5; i++) {
    setTimeout(createBubble, i * 300);
}

window.onblur = () => { isActive = false; };
window.onfocus = () => { isActive = true; };
