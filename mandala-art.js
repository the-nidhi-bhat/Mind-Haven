const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoText = document.getElementById('infoText');

// Canvas setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearCanvas();
});

// State
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let symmetry = 6;
let currentHue = 250;
let hueShift = 0;

// Color selection
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelector('.color-option.active').classList.remove('active');
        option.classList.add('active');
        currentHue = parseInt(option.dataset.hue);
        hueShift = 0;
    });
});

// Symmetry controls
function setSymmetry(num) {
    symmetry = num;
    document.querySelectorAll('.symmetry-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
});
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    infoText.classList.add('hidden');
    lastX = e.clientX || e.pageX;
    lastY = e.clientY || e.pageY;
}

function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX || e.pageX;
    const y = e.clientY || e.pageY;

    // Calculate center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw with symmetry
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < symmetry; i++) {
        ctx.save();

        // Rotate around center
        ctx.translate(centerX, centerY);
        ctx.rotate((Math.PI * 2 * i) / symmetry);
        ctx.translate(-centerX, -centerY);

        // Draw the line
        const gradient = ctx.createLinearGradient(lastX, lastY, x, y);
        const hue = (currentHue + hueShift) % 360;

        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue + 30}, 70%, 60%, 0.6)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + Math.random() * 2;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Mirror horizontally
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    ctx.restore();

    // Add glow effect
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < symmetry; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((Math.PI * 2 * i) / symmetry);
        ctx.translate(-centerX, -centerY);

        const hue = (currentHue + hueShift) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`;
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    ctx.restore();

    lastX = x;
    lastY = y;

    // Slowly shift hue for rainbow effect
    hueShift += 0.5;
}

function stopDrawing() {
    isDrawing = false;
    hueShift = 0;
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    infoText.classList.remove('hidden');
}

function saveArt() {
    const link = document.createElement('a');
    link.download = 'mandala-art.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Initialize
clearCanvas();
