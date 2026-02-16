// Init Theme
const savedTheme = localStorage.getItem('mh_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const gameArea = document.getElementById('gameArea');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

// Config
let balls = [];
let score = 0;
let speedMultiplier = 1; // 1, 2, 4
let baseSpeed = 1.5;
let isPlaying = true;
let startTime = Date.now();
let animationId;

// Mode Settings
const MODES = {
    slow: { speed: 1, targets: 1, distractors: 5 },
    medium: { speed: 2.5, targets: 2, distractors: 8 },
    fast: { speed: 4.5, targets: 3, distractors: 12 }
};
let currentMode = 'slow';

class Ball {
    constructor(type) {
        this.type = type; // 'target' or 'distractor'
        this.element = document.createElement('div');
        this.element.className = `ball ${type}`;

        // Random Size Variation
        const size = 40 + Math.random() * 30;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;

        this.rad = size / 2;

        // Position
        const { width, height } = gameArea.getBoundingClientRect();
        this.x = Math.random() * (width - size);
        this.y = Math.random() * (height - size);

        // Velocity
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * baseSpeed;
        this.vy = Math.sin(angle) * baseSpeed;

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

        // Interaction
        this.element.addEventListener('mousedown', (e) => this.handleClick(e));
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        });

        gameArea.appendChild(this.element);
    }

    update(width, height, speedMulti) {
        this.x += this.vx * speedMulti;
        this.y += this.vy * speedMulti;

        // Bounce
        if (this.x <= 0 || this.x + (this.rad * 2) >= width) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(this.x, width - (this.rad * 2)));
        }
        if (this.y <= 0 || this.y + (this.rad * 2) >= height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(this.y, height - (this.rad * 2)));
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    handleClick(e) {
        e.stopPropagation();
        if (this.type === 'target') {
            // Success
            score += 10;
            showFloatText(e.clientX, e.clientY, '+10', 'plus');
            this.reposition();
            // Maybe spawn a particle effect here
        } else {
            // Fail
            score = Math.max(0, score - 5);
            showFloatText(e.clientX, e.clientY, '-5', 'minus');
        }
        scoreEl.textContent = score;

        // Tiny visual feedback on ball
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(0.8)`;
        setTimeout(() => {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(1)`;
        }, 100);
    }

    reposition() {
        const { width, height } = gameArea.getBoundingClientRect();
        this.x = Math.random() * (width - this.rad * 2);
        this.y = Math.random() * (height - this.rad * 2);
    }
}

function showFloatText(x, y, text, type) {
    const el = document.createElement('div');
    el.className = `score-float score-${type}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function spawnBalls() {
    // Clear
    gameArea.innerHTML = '';
    balls = [];

    const config = MODES[currentMode];
    speedMultiplier = config.speed;

    // Spawn Targets
    for (let i = 0; i < config.targets; i++) balls.push(new Ball('target'));
    // Spawn Distractors
    for (let i = 0; i < config.distractors; i++) balls.push(new Ball('distractor'));
}

function loop() {
    if (!isPlaying) return;
    const { width, height } = gameArea.getBoundingClientRect();

    balls.forEach(b => b.update(width, height, speedMultiplier));

    // Timer
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

    animationId = requestAnimationFrame(loop);
}

function setSpeed(mode) {
    currentMode = mode;
    // Update buttons
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    spawnBalls();
}

function resetGame() {
    score = 0;
    scoreEl.textContent = '0';
    startTime = Date.now();
    spawnBalls();
}

// Handle Resize
window.addEventListener('resize', () => {
    // Optional: Handle out of bounds adjustment
});

// Init
spawnBalls();
loop();

// Cleanup
window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
});
