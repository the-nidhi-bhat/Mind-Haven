const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Grid setup
const CELL_SIZE = 4;
let GRID_WIDTH, GRID_HEIGHT;
let grid = [];
let nextGrid = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 70;
    GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
    GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);
    initGrid();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Materials
const MATERIALS = {
    empty: { color: '#000000', density: 0, state: 'gas' },
    sand: { color: '#f4a460', density: 3, state: 'powder' },
    water: { color: '#4a90e2', density: 2, state: 'liquid' },
    wall: { color: '#8b4513', density: 999, state: 'solid' },
    fire: { color: '#ff6b6b', density: 0, state: 'gas', life: 30 },
    plant: { color: '#2ecc71', density: 5, state: 'solid' },
    stone: { color: '#95a5a6', density: 10, state: 'solid' }
};

let currentMaterial = 'sand';
let brushSize = 3;
let isDrawing = false;

// Controls
document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
});

document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.material-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentMaterial = btn.dataset.type;
    });
});

// Initialize grid
function initGrid() {
    grid = Array(GRID_HEIGHT).fill().map(() =>
        Array(GRID_WIDTH).fill().map(() => ({ type: 'empty', life: 0 }))
    );
    nextGrid = Array(GRID_HEIGHT).fill().map(() =>
        Array(GRID_WIDTH).fill().map(() => ({ type: 'empty', life: 0 }))
    );
}

// Drawing
canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);
canvas.addEventListener('mousemove', handleDraw);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    handleDraw(e.touches[0]);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleDraw(e.touches[0]);
});
canvas.addEventListener('touchend', () => isDrawing = false);

function handleDraw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    for (let dy = -brushSize; dy <= brushSize; dy++) {
        for (let dx = -brushSize; dx <= brushSize; dx++) {
            if (dx * dx + dy * dy <= brushSize * brushSize) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                    grid[ny][nx] = {
                        type: currentMaterial,
                        life: MATERIALS[currentMaterial].life || 0
                    };
                }
            }
        }
    }
}

// Physics simulation
function update() {
    // Copy current grid to next
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            nextGrid[y][x] = { ...grid[y][x] };
        }
    }

    // Process from bottom to top
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = grid[y][x];
            if (cell.type === 'empty') continue;

            const mat = MATERIALS[cell.type];

            // Fire behavior
            if (cell.type === 'fire') {
                cell.life--;
                if (cell.life <= 0) {
                    nextGrid[y][x] = { type: 'empty', life: 0 };
                    continue;
                }
                // Fire rises
                if (y > 0 && grid[y - 1][x].type === 'empty') {
                    nextGrid[y - 1][x] = { ...cell };
                    nextGrid[y][x] = { type: 'empty', life: 0 };
                }
                // Burn plants
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                            if (grid[ny][nx].type === 'plant' && Math.random() > 0.9) {
                                nextGrid[ny][nx] = { type: 'fire', life: 20 };
                            }
                        }
                    }
                }
                continue;
            }

            // Powder (sand) behavior
            if (mat.state === 'powder') {
                if (y < GRID_HEIGHT - 1) {
                    const below = grid[y + 1][x];
                    if (below.type === 'empty' || MATERIALS[below.type].density < mat.density) {
                        nextGrid[y + 1][x] = { ...cell };
                        nextGrid[y][x] = { ...below };
                    } else {
                        // Try diagonal
                        const dir = Math.random() > 0.5 ? 1 : -1;
                        const nx = x + dir;
                        if (nx >= 0 && nx < GRID_WIDTH && grid[y + 1][nx].type === 'empty') {
                            nextGrid[y + 1][nx] = { ...cell };
                            nextGrid[y][x] = { type: 'empty', life: 0 };
                        }
                    }
                }
            }

            // Liquid (water) behavior
            if (mat.state === 'liquid') {
                if (y < GRID_HEIGHT - 1) {
                    const below = grid[y + 1][x];
                    if (below.type === 'empty' || (MATERIALS[below.type].density < mat.density && below.type !== 'wall')) {
                        nextGrid[y + 1][x] = { ...cell };
                        nextGrid[y][x] = { ...below };
                    } else {
                        // Spread horizontally
                        const dir = Math.random() > 0.5 ? 1 : -1;
                        const nx = x + dir;
                        if (nx >= 0 && nx < GRID_WIDTH && grid[y][nx].type === 'empty') {
                            nextGrid[y][nx] = { ...cell };
                            nextGrid[y][x] = { type: 'empty', life: 0 };
                        }
                    }
                }
                // Water extinguishes fire
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                            if (grid[ny][nx].type === 'fire') {
                                nextGrid[ny][nx] = { type: 'empty', life: 0 };
                            }
                        }
                    }
                }
            }
        }
    }

    // Swap grids
    [grid, nextGrid] = [nextGrid, grid];
}

// Render
function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = grid[y][x];
            if (cell.type !== 'empty') {
                let color = MATERIALS[cell.type].color;

                // Add variation to sand
                if (cell.type === 'sand') {
                    const variation = Math.floor(Math.random() * 20) - 10;
                    color = `rgb(${244 + variation}, ${164 + variation}, ${96 + variation})`;
                }

                // Fire flicker
                if (cell.type === 'fire') {
                    const hue = 0 + Math.random() * 30;
                    color = `hsl(${hue}, 100%, ${50 + Math.random() * 20}%)`;
                }

                ctx.fillStyle = color;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function clearGrid() {
    initGrid();
}

function saveArt() {
    const link = document.createElement('a');
    link.download = 'falling-sand-art.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Start
initGrid();
gameLoop();
