const words = [
    { word: "PEACE", hint: "Freedom from disturbance" },
    { word: "CALM", hint: "Not showing or feeling nervousness" },
    { word: "JOY", hint: "A feeling of great pleasure" },
    { word: "HOPE", hint: "A feeling of expectation" },
    { word: "LOVE", hint: "An intense feeling of deep affection" },
    { word: "RELAX", hint: "Make or become less tense" },
    { word: "BREATHE", hint: "Take air into the lungs" },
    { word: "NATURE", hint: "The physical world collectively" },
    { word: "SMILE", hint: "Form one's features into a pleased expression" },
    { word: "KIND", hint: "Having or showing a friendly nature" },
    { word: "FOCUS", hint: "Center of interest or activity" },
    { word: "HAPPY", hint: "Feeling or showing pleasure" },
    { word: "GROW", hint: "Become larger or greater" },
    { word: "DREAM", hint: "A series of thoughts during sleep" },
    { word: "TRUST", hint: "Firm belief in reliability" },
    { word: "LIGHT", hint: "The natural agent that stimulates sight" },
    { word: "ZEN", hint: "Peaceful and calm" },
    { word: "FLOW", hint: "Move along steadily and continuously" }
];

let currentObj = {};
let score = 0;

const scrambleEl = document.getElementById("scrambleWord");
const hintEl = document.getElementById("hintText");
const inputEl = document.getElementById("userGuess");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");

function initGame() {
    nextWord();

    // Allow 'Enter' key
    inputEl.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkWord();
        }
    });
}

function nextWord() {
    // Reset Check Button
    const btn = document.querySelector('.check-btn');
    if (btn) {
        btn.innerText = "Check";
        btn.onclick = checkWord;
        btn.style.background = "var(--primary)";
    }

    // Pick random word
    const randIndex = Math.floor(Math.random() * words.length);
    currentObj = words[randIndex];

    // Scramble it
    const scrambled = scramble(currentObj.word);

    // Update UI
    scrambleEl.innerText = scrambled;
    hintEl.innerText = "";
    inputEl.value = "";
    messageEl.innerText = "";
    messageEl.className = "message";
    inputEl.focus();
}

function scramble(word) {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's not same as original
    if (arr.join("") === word && word.length > 1) return scramble(word);
    return arr.join(" ");
}

function showHint() {
    hintEl.innerText = currentObj.hint;
}

function checkWord() {
    const guess = inputEl.value.trim().toUpperCase();
    if (!guess) return;

    if (guess === currentObj.word) {
        messageEl.innerText = "Correct! Well done.";
        messageEl.className = "message correct";
        score += 10;
        scoreEl.innerText = score;

        // Change button to Next
        const btn = document.querySelector('.check-btn');
        if (btn) {
            btn.innerText = "Next Word";
            btn.onclick = nextWord;
            btn.style.background = "var(--success)";
        }
    } else {
        messageEl.innerText = "Try again!";
        messageEl.className = "message wrong";
        // Shake animation effect could go here
    }
}

// Global scope
window.checkWord = checkWord;
window.nextWord = nextWord;
window.showHint = showHint;

initGame();
