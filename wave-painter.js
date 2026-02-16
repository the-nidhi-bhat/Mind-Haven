// Theme
const savedTheme = localStorage.getItem('mh_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const maxWidth = Math.min(window.innerWidth - 80, 1000);
    const maxHeight = window.innerHeight - 250;
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// State
let isDrawing = false;
let points = [];
let currentColor = 'purple';
let currentMode = 'calm';

// Color palettes
const colors = {
    purple: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    blue: ['#3b82f6', '#06b6d4', '#0ea5e9', '#38bdf8'],
    green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    yellow: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
    pink: ['#ec4899', '#f472b6', '#fb7185', '#fda4af'],
    sage: ['#87a383', '#c9dcc4', '#d4c5e8', '#e8f3e5']
};

// Wave modes
const modes = {
    calm: { amplitude: 15, frequency: 0.02, speed: 0.5, waves: 3 },
    flow: { amplitude: 25, frequency: 0.03, speed: 1, waves: 5 },
    energy: { amplitude: 40, frequency: 0.05, speed: 2, waves: 7 }
};

let time = 0;

function setColor(color) {
    currentColor = color;
    document.querySelectorAll('.color-picker').forEach(el => {
        el.classList.toggle('active', el.dataset.color === color);
    });
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.id && btn.id.startsWith('btn-')) {
            btn.classList.remove('active');
        }
    });
    document.getElementById(`btn-${mode}`).classList.add('active');
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
}

// Drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    startDrawing({ offsetX: x, offsetY: y });
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    draw({ offsetX: x, offsetY: y });
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
});

function startDrawing(e) {
    isDrawing = true;
    points = [{ x: e.offsetX, y: e.offsetY }];
}

function draw(e) {
    if (!isDrawing) return;

    points.push({ x: e.offsetX, y: e.offsetY });

    // Keep only recent points for performance
    if (points.length > 100) {
        points.shift();
    }

    drawWaves();
}

function stopDrawing() {
    isDrawing = false;
}

function drawWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    const config = modes[currentMode];
    const palette = colors[currentColor];

    // Draw multiple wave layers
    for (let layer = 0; layer < config.waves; layer++) {
        ctx.beginPath();
        ctx.strokeStyle = palette[layer % palette.length];
        ctx.lineWidth = 3 - (layer * 0.3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const offset = layer * 10;
        const phaseShift = layer * Math.PI / 4;

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const wave = Math.sin((i * config.frequency) + time + phaseShift) * config.amplitude;

            const x = point.x;
            const y = point.y + wave + offset;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                // Smooth curve
                const prevPoint = points[i - 1];
                const prevWave = Math.sin(((i - 1) * config.frequency) + time + phaseShift) * config.amplitude;
                const prevX = prevPoint.x;
                const prevY = prevPoint.y + prevWave + offset;

                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;

                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
        }

        ctx.globalAlpha = 0.6 - (layer * 0.08);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

// Animation loop
function animate() {
    time += modes[currentMode].speed * 0.05;

    if (isDrawing || points.length > 0) {
        drawWaves();
    }

    requestAnimationFrame(animate);
}

animate();
