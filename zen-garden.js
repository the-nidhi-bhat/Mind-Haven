const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gardenWrapper = document.getElementById('gardenWrapper');

// State
let currentTool = 'rake';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let placedElements = [];
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// Initialize sand
function initSand() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0e6d2');
    gradient.addColorStop(0.5, '#e8d5b7');
    gradient.addColorStop(1, '#d4c5a9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 15000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        const opacity = 0.02 + Math.random() * 0.05;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(x, y, size, size);
    }
}

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${tool}`).classList.add('active');
}

// Drag and drop from sidebar
document.querySelectorAll('.element-item').forEach(item => {
    // Mouse Drag (Desktop)
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('emoji', item.dataset.emoji);
        e.dataTransfer.setData('type', item.dataset.type);
    });

    // Touch Tap (Mobile) - Spawns in center
    item.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scroll
        const rect = gardenWrapper.getBoundingClientRect();
        placeElement(item.dataset.emoji, item.dataset.type, rect.width / 2, rect.height / 2);
    });

    // Also allow click for accessibility
    item.addEventListener('click', () => {
        const rect = gardenWrapper.getBoundingClientRect();
        placeElement(item.dataset.emoji, item.dataset.type, rect.width / 2, rect.height / 2);
    });
});

gardenWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
});

gardenWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData('emoji');
    const type = e.dataTransfer.getData('type');

    if (emoji) {
        const rect = gardenWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        placeElement(emoji, type, x, y);
    }
});

function placeElement(emoji, type, x, y) {
    const element = document.createElement('div');
    element.className = 'placed-element';
    element.textContent = emoji;
    element.style.fontSize = '3rem';
    element.style.left = (x - 25) + 'px';
    element.style.top = (y - 25) + 'px';
    element.dataset.type = type;

    // Make element draggable
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });

    // Remove on double interaction
    element.addEventListener('dblclick', () => element.remove());

    // Long press to remove on mobile? Or simple tap menu? 
    // For now stick to dblclick (desktop) and maybe add a delete tool later.
    // Let's add specific double tap logic if needed, but for now allow desktop parity.

    gardenWrapper.appendChild(element);
    placedElements.push(element);
}

function startDrag(e) {
    if (currentTool !== 'rake' && currentTool !== 'circles' && currentTool !== 'erase') return;

    if (e.type === 'touchstart') e.preventDefault();

    draggedElement = e.target;
    draggedElement.classList.add('dragging');

    const rect = draggedElement.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;

    if (e.type === 'touchstart') {
        document.addEventListener('touchmove', doDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    } else {
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }
}

function doDrag(e) {
    if (!draggedElement) return;
    e.preventDefault();

    const wrapperRect = gardenWrapper.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - wrapperRect.left - dragOffset.x;
    const y = clientY - wrapperRect.top - dragOffset.y;

    draggedElement.style.left = x + 'px';
    draggedElement.style.top = y + 'px';
}

function stopDrag() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', doDrag);
    document.removeEventListener('touchend', stopDrag);
}

// Drawing on canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch Drawing
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    const rect = canvas.getBoundingClientRect();
    isDrawing = true;
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'rake') {
        rakeLines(x, y);
    } else if (currentTool === 'circles') {
        rakeCircles(x, y);
    } else if (currentTool === 'erase') {
        eraseSand(x, y);
    }

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function rakeLines(x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const angle = Math.atan2(y - lastY, x - lastX);
    const perpAngle = angle + Math.PI / 2;
    const spacing = 10;
    const numLines = 6;

    for (let i = -numLines; i <= numLines; i++) {
        const offsetX = Math.cos(perpAngle) * spacing * i;
        const offsetY = Math.sin(perpAngle) * spacing * i;

        ctx.beginPath();
        ctx.moveTo(lastX + offsetX, lastY + offsetY);
        ctx.lineTo(x + offsetX, y + offsetY);
        ctx.stroke();
    }

    ctx.restore();
}

function rakeCircles(x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 2;

    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(x, y, i * 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function eraseSand(x, y) {
    const radius = 40;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#e8d5b7');
    gradient.addColorStop(1, 'rgba(232, 213, 183, 0)');

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function clearGarden() {
    placedElements.forEach(el => el.remove());
    placedElements = [];
    initSand();
}

function saveGarden() {
    // Temporarily hide controls
    document.querySelectorAll('.tools, .controls').forEach(el => el.style.display = 'none');

    html2canvas(gardenWrapper).then(canvas => {
        const link = document.createElement('a');
        link.download = 'zen-garden.png';
        link.href = canvas.toDataURL();
        link.click();

        // Show controls again
        document.querySelectorAll('.tools, .controls').forEach(el => el.style.display = '');
    });
}

// Initialize
initSand();
