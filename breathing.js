const circle = document.getElementById("breathingCircle");
const text = document.getElementById("breathingText");
const instruction = document.getElementById("instruction");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

let intervalId = null;
let phase = 0;
const phases = [
    { name: "Inhale", duration: 4, class: "inhale" },
    { name: "Hold", duration: 4, class: "inhale" },
    { name: "Exhale", duration: 4, class: "exhale" },
    { name: "Hold", duration: 4, class: "exhale" }
];

function startBreathing() {
    startBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
    phase = 0;
    runPhase();
}

function stopBreathing() {
    startBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
    clearInterval(intervalId);
    circle.className = "breathing-circle";
    instruction.textContent = "Click 'Start' to begin again";
    text.textContent = "";
}

function runPhase() {
    const current = phases[phase];
    instruction.textContent = current.name;
    circle.className = "breathing-circle " + current.class;

    let count = current.duration;
    text.textContent = count;

    intervalId = setInterval(() => {
        count--;
        text.textContent = count;

        if (count === 0) {
            clearInterval(intervalId);
            phase = (phase + 1) % 4;
            setTimeout(runPhase, 500);
        }
    }, 1000);
}

startBtn.addEventListener("click", startBreathing);
stopBtn.addEventListener("click", stopBreathing);
