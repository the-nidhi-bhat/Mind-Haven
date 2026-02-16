/* Ensure global scope access */
window.initGame = initGame;
window.closeModal = closeModal;

const grid = document.getElementById('gameGrid');
const moveCountEl = document.getElementById('moveCount');
const pairsFoundEl = document.getElementById('pairsFound');
const messageArea = document.getElementById('messageArea');
const modal = document.getElementById('winModal');
const finalMovesEl = document.getElementById('finalMoves');

// Use very standard, free FontAwesome icons
const icons = [
    'fa-star',
    'fa-heart',
    'fa-bell',
    'fa-anchor',
    'fa-bolt',
    'fa-cube',
    'fa-leaf',
    'fa-paper-plane'
];

let cards = [];
let flippedCards = [];
let moves = 0;
let pairs = 0;
let isLocked = false;

function initGame() {
    // Reset Logic
    cards = [];
    flippedCards = [];
    moves = 0;
    pairs = 0;
    isLocked = false;

    // Reset UI
    if (moveCountEl) moveCountEl.innerText = '0';
    if (pairsFoundEl) pairsFoundEl.innerText = '0';
    if (messageArea) messageArea.innerText = 'Find all matching pairs!';
    if (modal) modal.classList.add('hidden');

    // Create Deck
    const deck = [...icons, ...icons];
    // Fisher-Yates Shuffle for better randomness
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Render
    if (grid) {
        grid.innerHTML = '';
        deck.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.icon = icon;
            card.dataset.index = index;

            // Front (what you see when flipped)
            // Back (what you see initially)
            // Note: In CSS, we rotate .card-front to 180deg. 
            // So if .card is 0deg, we see .card-back.

            card.innerHTML = `
                <div class="card-face card-front">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="card-face card-back">
                    <i class="fas fa-question"></i>
                </div>
            `;

            card.addEventListener('click', function () {
                handleCardClick(this);
            });
            grid.appendChild(card);
        });
    }
}

function handleCardClick(card) {
    if (isLocked) return;
    if (card.classList.contains('flip')) return; // Already flipped
    if (card.classList.contains('matched')) return; // Already matched

    // Perform Flip
    card.classList.add('flip');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        if (moveCountEl) moveCountEl.innerText = moves;
        checkMatch();
    }
}

function checkMatch() {
    isLocked = true;

    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    const icon1 = card1.dataset.icon;
    const icon2 = card2.dataset.icon;

    if (icon1 === icon2) {
        // MATCH found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            pairs++;
            if (pairsFoundEl) pairsFoundEl.innerText = pairs;

            // Check win condition
            if (pairs === icons.length) {
                endGame();
            }

            resetTurn();
        }, 500);
    } else {
        // NO MATCH
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    flippedCards = [];
    isLocked = false;
}

function endGame() {
    if (messageArea) messageArea.innerText = 'All pairs found!';
    if (finalMovesEl) finalMovesEl.innerText = moves;
    if (modal) {
        modal.classList.remove('hidden');
        // Simple pop animation reset
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.animation = 'none';
            content.offsetHeight; /* trigger reflow */
            content.style.animation = 'popIn 0.3s ease-out';
        }
    }
}

function closeModal() {
    if (modal) modal.classList.add('hidden');
}

// Ensure the DOM is fully loaded before running init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
