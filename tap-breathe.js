const breathCircle = document.getElementById('breathCircle');
const breathText = document.getElementById('breathText');
const instruction = document.getElementById('instruction');
const cyclesEl = document.getElementById('cycles');
const durationEl = document.getElementById('duration');

// Theme
const savedTheme = localStorage.getItem('mh_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// State
let isActive = false;
let currentPhase = 'ready';
let pattern = { inhale: 4, hold1: 4, exhale: 4, hold2: 4, name: 'Box Breathing' };
let cycles = 0;
let startTime = null;
let durationInterval = null;
let phaseTimeout = null;

// Patterns
const PATTERNS = {
    '4-4-4-4': { inhale: 4, hold1: 4, exhale: 4, hold2: 4, name: 'Box Breathing' },
    '4-7-8': { inhale: 4, hold1: 7, exhale: 8, hold2: 0, name: '4-7-8 Relaxation' },
    '5-5': { inhale: 5, hold1: 0, exhale: 5, hold2: 0, name: 'Equal Breathing' }
};

function setPattern(patternName) {
    if (isActive) {
        // Optional: Stop current if switching? For now, we allow switching mid-game next cycle or restart?
        // Let's reset for better UX
        stopBreathing();
    }

    pattern = PATTERNS[patternName];

    // Update button states
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${patternName}`).classList.add('active');

    instruction.textContent = `${pattern.name} - Tap circle to start`;
    breathText.innerHTML = "Tap to<br>Start";
}

breathCircle.addEventListener('click', (e) => handleTap(e));
// Prevent double firing on touch devices that might fire click and touchstart
breathCircle.addEventListener('touchstart', (e) => {
    e.preventDefault(); // prevents mouse emulation
    handleTap(e);
}, {
    passive: false
});

function handleTap(e) {
    // Create ripple effect at click position or center
    createRipple(e);

    if (!isActive) {
        startBreathing();
    } else {
        stopBreathing();
    }
}

function startBreathing() {
    isActive = true;
    cycles = 0;
    cyclesEl.textContent = cycles;
    startTime = Date.now();

    // Reset timer display
    durationEl.textContent = "0:00";

    if (durationInterval) clearInterval(durationInterval);
    durationInterval = setInterval(updateDuration, 1000);

    nextPhase('inhale');
}

function stopBreathing() {
    isActive = false;
    if (phaseTimeout) clearTimeout(phaseTimeout);
    if (durationInterval) clearInterval(durationInterval);
    breathCircle.className = 'breath-circle';
    breathCircle.style.transition = 'all 0.5s ease';
    breathText.innerHTML = "Tap to<br>Start";
    instruction.textContent = `${pattern.name} - Tap circle to start`;
}

function nextPhase(phase) {
    if (!isActive) return;

    currentPhase = phase;
    let duration = 0;
    let nextStep = '';

    switch (phase) {
        case 'inhale':
            duration = pattern.inhale;
            breathText.textContent = 'Inhale';
            instruction.textContent = `Breathe in deeply for ${duration}s`;
            breathCircle.className = 'breath-circle inhale';
            breathCircle.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`; // Smooth expansion

            if (pattern.hold1 > 0) nextStep = 'hold1';
            else nextStep = 'exhale';
            break;

        case 'hold1':
            duration = pattern.hold1;
            breathText.textContent = 'Hold';
            instruction.textContent = `Hold your breath for ${duration}s`;
            breathCircle.className = 'breath-circle hold-in';
            breathCircle.style.transition = `all 0.5s ease`; // Quick transition to hold color

            nextStep = 'exhale';
            break;

        case 'exhale':
            duration = pattern.exhale;
            breathText.textContent = 'Exhale';
            instruction.textContent = `Release slowly for ${duration}s`;
            breathCircle.className = 'breath-circle exhale';
            breathCircle.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`; // Smooth contraction

            if (pattern.hold2 > 0) nextStep = 'hold2';
            else nextStep = 'cycle_complete';
            break;

        case 'hold2':
            duration = pattern.hold2;
            breathText.textContent = 'Hold';
            instruction.textContent = `Empty lung hold for ${duration}s`;
            breathCircle.className = 'breath-circle hold-out';
            breathCircle.style.transition = `all 0.5s ease`;

            nextStep = 'cycle_complete';
            break;
    }

    if (duration > 0) {
        phaseTimeout = setTimeout(() => {
            if (nextStep === 'cycle_complete') {
                completeCycle();
            } else {
                nextPhase(nextStep);
            }
        }, duration * 1000);
    }
}

function completeCycle() {
    cycles++;
    cyclesEl.textContent = cycles;
    // Short pause before next inhale
    nextPhase('inhale');
}

function updateDuration() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    durationEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createRipple(e) {
    const rect = breathCircle.getBoundingClientRect();
    let x, y;

    if (e.type === 'touchstart') {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    // Fallback to center if coordinates are messy
    if (isNaN(x) || isNaN(y)) {
        x = rect.width / 2;
        y = rect.height / 2;
    }

    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';

    breathCircle.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
}

window.addEventListener('beforeunload', () => {
    if (phaseTimeout) clearTimeout(phaseTimeout);
    if (durationInterval) clearInterval(durationInterval);
});
