// --- 1. INITIALIZE SYSTEM ---
const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// Do not create 'recognition' immediately here if you want to handle errors/restart per session
// But maintaining a global instance is fine if we handle hooks correctly.
let recognition = SpeechRecognition ? new SpeechRecognition() : null;

// --- CONVERSATION STATE MANAGEMENT ---
let conversationState = {
    lastOffer: null,           // What was last offered (breathing, writing, grounding, etc.)
    awaitingConsent: false,    // Are we waiting for yes/no?
    currentFeature: null,      // Currently active feature
    featureStep: 0,            // Current step in multi-step features
    userWriting: null,          // Store user's writing for acknowledgment
    gameRiddle: null           // Stores current riddle for game feature
};

// --- THEME MANAGEMENT ---
function initTheme() {
    const savedTheme = localStorage.getItem('mh_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mh_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    if (!icon) return;

    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// Add event listener for theme toggle
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

// --- LIFE ARCHITECT STATE MANAGEMENT ---
let lifeArchitectState = {
    tasks: [],      // [{type: 'goal'|'task', content: '...'}]
    planner: [],    // [{content: '...'}, ...]
    habits: [],     // ['Drink water', 'Exercise']
    ideas: [],      // ['App idea', 'Painting concept']
    offline: [],    // ['Gym at 5pm', 'Doctor at 10am']
    voiceNotes: [], // transcribed voice notes
    history: [],    // ['User: Hello', 'Bot: Hi'] - History Log
    currentTheme: 'default' // 'theme-ocean', 'theme-forest', etc.
};

// Load from LocalStorage
try {
    const savedState = localStorage.getItem('lifeArchitectState');
    if (savedState) {
        lifeArchitectState = JSON.parse(savedState);
        // Apply saved theme on load
        if (lifeArchitectState.currentTheme && lifeArchitectState.currentTheme !== 'default') {
            document.body.className = lifeArchitectState.currentTheme;
        }
    }
} catch (e) {
    console.log("Could not load state:", e);
}

function saveLifeState() {
    localStorage.setItem('lifeArchitectState', JSON.stringify(lifeArchitectState));
}

function addToHistory(speaker, text) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lifeArchitectState.history.push(`[${timestamp}] ${speaker}: ${text}`);
    if (lifeArchitectState.history.length > 50) lifeArchitectState.history.shift(); // Keep last 50
    saveLifeState();
}

// Ensure voice is ready
if (recognition) {
    recognition.lang = 'en-US';
    recognition.continuous = false; // Capture single sentence usually safer
    recognition.interimResults = false;

    recognition.onstart = () => {
        console.log("Mic started");
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.classList.add('listening'); // Add visual cue if css supports
    };

    recognition.onend = () => {
        console.log("Mic stopped");
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.classList.remove('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Heard:", transcript);
        const inputField = document.getElementById('user-input');
        if (inputField) {
            inputField.value = transcript;
            handleSendMessage(); // Auto-send or let user send? User said "work properly", auto-send feels magical.
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            alert("Microphone access blocked. Please check your browser settings.");
        }
    };
}

// --- CONSENT KEYWORDS ---
const yesKeywords = ["yes", "yeah", "yep", "sure", "okay", "ok", "yea", "yup", "please", "pikachu", "pika", "i'd like that", "let's do it", "sounds good", "alright", "yes please", "go ahead", "i want to", "haan", "ha", "theek hai", "chalo"];
const noKeywords = ["no", "nope", "nah", "not now", "maybe later", "skip", "no thanks", "not really", "i'm fine", "nahin", "nahi", "mat", "rehne do"];

// --- 2. FEATURE IMPLEMENTATIONS ---

const features = {
    // 🫁 BREATHING EXERCISE FEATURE
    breathing: {
        name: "Breathing Exercise",
        steps: [
            "Let's begin a calming breathing exercise 🌬️\n\nFind a comfortable position and close your eyes if you'd like...",
            "Step 1: Breathe IN slowly through your nose for 4 seconds... 1... 2... 3... 4... 🌸",
            "Step 2: HOLD your breath gently for 4 seconds... 1... 2... 3... 4... ✨",
            "Step 3: Breathe OUT slowly through your mouth for 6 seconds... 1... 2... 3... 4... 5... 6... 🍃",
            "Step 4: HOLD empty for 2 seconds... 1... 2... 💫",
            "Great! Let's repeat this cycle. Breathe IN... 1... 2... 3... 4... 🌸",
            "HOLD... 1... 2... 3... 4... ✨",
            "Breathe OUT... 1... 2... 3... 4... 5... 6... 🍃",
            "Wonderful! 🌿 You've completed the breathing exercise. How do you feel now? Take your time to respond."
        ],
        trigger: ["tired", "stressed", "anxious", "panicking", "overwhelmed", "can't breathe", "heart racing", "pressure", "nervous", "exhausted", "drained", "burnt out"]
    },

    // ✍️ WRITING/JOURNALING FEATURE
    writing: {
        name: "Writing Exercise",
        prompt: "Let's try a gentle writing exercise 📝\n\nTake a moment and write down ONE thing you're feeling or thinking right now. It doesn't have to be perfect—just let it out. I'm here to listen without judgment 🤍",
        acknowledgments: [
            "Thank you for sharing that with me 🤍 Writing it out can help lighten the load. Your feelings are valid.",
            "I hear you 💙 Thank you for trusting me with your thoughts. Remember, it's okay to feel this way.",
            "That took courage to write 🌸 I'm grateful you shared. You're not alone in this.",
            "Thank you for opening up 🌿 Your words matter, and so do your feelings.",
            "I appreciate you sharing that 💛 Sometimes putting feelings into words helps us process them."
        ],
        trigger: ["sad", "lonely", "empty", "hopeless", "depressed", "crying", "worthless", "lost", "numb", "feeling alone", "no one understands"]
    },

    // 🌿 GROUNDING FEATURE (5-4-3-2-1 Technique)
    grounding: {
        name: "Grounding Exercise",
        steps: [
            "Let's do a grounding exercise to bring you back to the present moment 🌿\n\nThis is called the 5-4-3-2-1 technique...",
            "Step 1: Look around and name 5 things you can SEE 👀\n\n(Take your time, then tell me what you see)",
            "Good! Now, name 4 things you can TOUCH or feel right now 🖐️\n\n(The texture of your clothes, the surface you're sitting on...)",
            "Great! Now, name 3 things you can HEAR 👂\n\n(Distant sounds, nearby sounds, even your own breathing...)",
            "Wonderful! Now, name 2 things you can SMELL 👃\n\n(Or 2 smells you like if you can't smell anything right now)",
            "Almost there! Finally, name 1 thing you can TASTE 👅\n\n(Or take a sip of water and notice how it feels)",
            "You did it! 🌟 The 5-4-3-2-1 grounding exercise is complete. You are HERE, in this moment, and you are SAFE. How do you feel now?"
        ],
        trigger: ["panic", "panicking", "scared", "losing control", "overwhelmed", "breaking down", "can't breathe"]
    },

    // 🌄 VISUALIZATION FEATURE
    visualization: {
        name: "Visualization Exercise",
        steps: [
            "Let's take a peaceful journey in your mind 🌄\n\nClose your eyes and take a deep breath...",
            "Imagine yourself walking on a beautiful, quiet beach 🏖️\n\nThe sand is warm and soft under your feet...",
            "Listen to the gentle waves washing onto the shore 🌊\n\nIn... and out... like your breath...",
            "Feel the warm sunlight on your skin ☀️\n\nA gentle breeze carries away any tension you're holding...",
            "Look around this peaceful place 🌴\n\nThe sky is a beautiful blue, seagulls call in the distance...",
            "You are completely safe here 🤍\n\nThis is YOUR peaceful place. You can return here anytime you need calm...",
            "Now, slowly, gently, bring your attention back 🌸\n\nWiggle your fingers and toes... Take a deep breath... And when you're ready, open your eyes.\n\nHow do you feel?"
        ],
        trigger: ["mentally tired", "need to relax", "exhausted", "drained", "want peace", "need calm"]
    },

    // 😴 SLEEP SUPPORT FEATURE
    sleepSupport: {
        name: "Sleep Support",
        steps: [
            "Let's help your mind prepare for rest 🌙\n\nGet into a comfortable position and dim the lights if you can...",
            "Close your eyes and take a slow, deep breath 💤\n\nInhale peace... exhale the day's worries...",
            "Let's do a body scan: Start at your toes 🦶\n\nFeel them relax and become heavy...",
            "Move up to your legs and thighs 🌿\n\nLet all the tension melt away...",
            "Your stomach and chest are soft and relaxed 🌸\n\nYour breathing is slow and calm...",
            "Your shoulders drop... your arms are heavy and warm 💫\n\nAll tension flows out through your fingertips...",
            "Your face is peaceful... jaw unclenched... eyes soft 😌\n\nYou are safe. You are calm. You are ready for rest...",
            "If thoughts come, let them float by like clouds ☁️\n\nYou don't need to hold onto them tonight...\n\nGoodnight 🌙 Sweet dreams."
        ],
        trigger: ["can't sleep", "insomnia", "late night", "night thoughts", "want to sleep", "need rest", "bed time"]
    },

    // 😡 ANGER RELEASE FEATURE
    angerRelease: {
        name: "Anger Release Exercise",
        steps: [
            "I hear that you're feeling intense emotions right now 😤\n\nLet's find a safe way to release some of that energy...",
            "Step 1: Physical Release 💪\n\nMake tight fists with both hands. Squeeze as hard as you can for 5 seconds... then RELEASE. Feel the difference.",
            "Step 2: Let's do that again 🔥\n\nClench your fists, tense your arms... hold for 5... and RELEASE. Let the tension flow out.",
            "Step 3: Shoulder tension 🙌\n\nRaise your shoulders up to your ears, hold tight for 5 seconds... and DROP them down. Release.",
            "Step 4: Deep breathing 🌬️\n\nNow take a deep breath in through your nose... and exhale STRONGLY through your mouth. Like you're blowing the anger out.",
            "Step 5: One more breath 🍃\n\nInhale slowly... and exhale all that heat... let it go...",
            "You've released some of that energy safely 🌿\n\nIt's okay to feel angry—it's a valid emotion. Would you like to talk about what's bothering you, or do another round?"
        ],
        trigger: ["angry", "furious", "rage", "mad", "pissed", "irritated", "frustrated", "fed up", "had enough"]
    },

    // 📖 STORIES FEATURE
    stories: {
        name: "Calming Stories",
        content: [
            "Once, there was a quiet little seed buried deep in the earth 🌰. It felt dark and lonely, but it waited patiently. One day, a gentle rain fell 🌧️, and the seed felt a spark of life. Slowly, it pushed its way up through the soil, reaching for the warmth of the sun ☀️. It grew into a strong, beautiful tree, providing shade and shelter for all who came near. Just like the seed, you too are growing, even when it feels dark.",
            "Imagine a small paper boat floating down a gentle stream ⛵. The water carries it effortlessly, around smooth stones and under leafy branches. The boat doesn't worry about where it's going; it just trusts the flow. It glides peacefully, rocking softly with the ripples. You can be like that boat—trusting, floating, and safe in the flow of life.",
            "High up in the mountains, there is a silent lake 🏔️. The water is so still it looks like a mirror, reflecting the blue sky and fluffy clouds. No matter how strong the wind blows, the deep water remains calm and undisturbed. Within you, there is also a place of deep stillness, a quiet lake where you can always find peace."
        ],
        trigger: ["story", "stories", "tale"]
    },

    // 🎮 GAMES FEATURE (Riddles)
    games: {
        name: "Mindful Riddles",
        riddles: [
            { q: "Pika? I have keys but no locks. I have a space but no room. You can enter, but never go outside. What am I? 🎹", a: "keyboard" },
            { q: "Pika pika! The more of me you take, the more you leave behind. What am I? 👣", a: "footsteps" },
            { q: "Chuu~ What comes once in a minute, twice in a moment, but never in a thousand years? ⏳", a: "m" },
            { q: "Pika! I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? 🌬️", a: "echo" },
            { q: "Piiika! I am always hungry, I must always be fed. The finger I touch, will soon turn red. What am I? 🔥", a: "fire" }
        ],
        trigger: ["game", "riddle", "play", "bored"]
    },

    // 🧘 YOGA FEATURE
    yoga: {
        name: "Yoga Session",
        steps: [
            "Pika Pika! Let's stretch together! 🧘‍♂️\n\nFind a comfy spot on the floor... Chuu~",
            "Step 1: Mountain Pose 🏔️\nStand tall, feet together, shoulders back. Breathe deep... Pika...",
            "Step 2: Tree Pose 🌳\nLift one foot and place it on your other leg. Balance! Pika pika!",
            "Step 3: Cat-Cow 🐈🐄\nOn hands and knees... Look up (Moo!), then look down (Meow!)... Just kidding, Pika!",
            "Step 4: Child's Pose 👶\nSit back on your heels, joyful stretch forward... Relax... Chuu~",
            "Great job! You are flexible like a Pikachu! ⚡ How do you feel?"
        ],
        trigger: ["yoga", "stretch", "flexible", "body"]
    },

    // 🏃 EXERCISE FEATURE
    exercise: {
        name: "Quick Workout",
        steps: [
            "Pika! Time to get moving! ⚡ Let's get energized!",
            "Step 1: 10 Jumping Jacks! 🌟\nJump up! Pika! Jump! Pika! (Count to 10)",
            "Step 2: High Knees! 🦵\nMarch in place, knees high! 1, 2, 1, 2... Pika Pika!",
            "Step 3: Arm Circles 🙆‍♂️\nSpin your arms forward... now backward... Feel the power! ⚡",
            "Step 4: Deep Squats 🏋️\nDown... and Up! Strong legs like Pikachu! Chuu~",
            "Pikaaaa! You did it! So strong! 💪 How's your energy now?"
        ],
        trigger: ["exercise", "workout", "gym", "fitness", "move"]
    }
};

// --- 3. THE CORE ENGINE ---
function getChatbotResponse(userInput) {
    // Check if memory (responses) actually loaded
    if (typeof responses === 'undefined') {
        console.error("CRITICAL ERROR: 'responses' is not defined. Check response.js for errors.");
        return "Pika... I can't remember! (Check response.js) ⚡";
    }

    const cleanInput = userInput.toLowerCase().trim();

    // --- CHECK FOR YES/NO RESPONSE FIRST ---
    if (conversationState.awaitingConsent) {
        const isYes = yesKeywords.some(word => cleanInput.includes(word));
        const isNo = noKeywords.some(word => cleanInput.includes(word));

        if (isYes) {
            return startFeature(conversationState.lastOffer);
        } else if (isNo) {
            conversationState.awaitingConsent = false;
            conversationState.lastOffer = null;
            return getNoResponse();
        }
    }

    // --- CHECK IF USER IS IN ACTIVE FEATURE ---
    if (conversationState.currentFeature) {
        return handleActiveFeature(userInput);
    }

    // --- IMPROVED KEYWORD MATCHING (Best Match) ---
    let bestMatch = null;
    let matchedCategory = null;

    // Negation check regex (checks for 'not', 'no', 'never', 'dont' before keyword)
    // Matches "not happy", "don't feel good", etc. within ~3 words
    const negationRegex = /(not|no|never|n't|dont|cannot|cant)\s+(\w+\s+){0,3}$/;

    for (const category in responses) {
        const data = responses[category];

        // Find matches in this category
        const matches = data.keywords.filter(keyword => cleanInput.includes(keyword.toLowerCase()));

        for (const match of matches) {
            // 1. Negation Check: If keyword is "happy" but input says "not happy", ignore "happy".
            // EXCEPT if the keyword ITSELF contains negation (e.g. "not happy"), then it's valid.
            const isKeywordNegated = match.includes("not ") || match.includes("n't ") || match.includes("no ");

            if (!isKeywordNegated) {
                const matchIndex = cleanInput.indexOf(match);
                const textBefore = cleanInput.substring(0, matchIndex).trim();
                if (negationRegex.test(textBefore)) {
                    continue; // Skip this match, it is negated
                }
            }

            // 2. Best Match Logic: Longest keyword wins
            if (!bestMatch || match.length > bestMatch.length) {
                bestMatch = match;
                matchedCategory = category;
            }
        }
    }

    if (bestMatch && matchedCategory) {
        const data = responses[matchedCategory];

        // Get Response
        let response;
        if (data.replies && typeof data.replies === 'object' && !Array.isArray(data.replies)) {
            // Try to find specific response for matched keyword, else default
            response = data.replies[bestMatch] || data.replies.default;
        } else if (Array.isArray(data.replies)) {
            response = data.replies[Math.floor(Math.random() * data.replies.length)];
        }

        // Feature Offer
        const featureOffer = checkForFeatureOffer(bestMatch, matchedCategory);
        if (featureOffer) {
            // SMART START: If the user explicitly ASKED for it (e.g. "Tell me a story", "Play game"), start immediately.
            // We assume longer keywords (3+ words) or specific verbs imply consent.
            const directStartVerbs = ["tell", "play", "start", "do", "give", "show", "begin", "let's", "lets"];
            const isDirectCommand = directStartVerbs.some(v => bestMatch.startsWith(v)) || bestMatch.length > 15 || cleanInput.includes("want to");

            if (isDirectCommand) {
                // Return the response preamble + the feature content immediately
                // We need to bypass the consent state and just call startFeature
                const featureStartText = startFeature(featureOffer);
                return response + "\n\n" + featureStartText;
            } else {
                conversationState.awaitingConsent = true;
                conversationState.lastOffer = featureOffer;
                return response + "\n\n" + getConsentQuestion(featureOffer);
            }
        }

        return response;
    }

    // --- FALLBACK ---
    return fallbackResponse || "Pika pika? I'm listening... Chuu~ 🌿";
}

// --- CHECK WHICH FEATURE TO OFFER ---
function checkForFeatureOffer(keyword, category) {
    const lowerKeyword = keyword.toLowerCase();

    // Check each feature's trigger keywords
    for (const featureName in features) {
        const feature = features[featureName];
        if (feature.trigger && feature.trigger.some(t => lowerKeyword.includes(t) || t.includes(lowerKeyword))) {
            return featureName;
        }
    }

    // Category-based feature mapping
    const categoryFeatureMap = {
        'mildStress': 'breathing',
        'highStress': 'grounding',
        'lowMood': 'writing',
        'anger': 'angerRelease',
        'sleep': 'sleepSupport',
        'story': 'stories',
        'game': 'games',
        'yoga': 'yoga',
        'exercise': 'exercise',
        'affirmation': null, // No interactive feature, just text
        'motivation': null   // No interactive feature, just text
    };

    return categoryFeatureMap[category] || null;
}

// --- GET CONSENT QUESTION ---
function getConsentQuestion(featureName) {
    const questions = {
        breathing: "Pika? Would you like to try a breathing exercise? (Yes / No) 🌬️",
        writing: "Chuu~ Want to write down your thoughts? It helps! (Yes / No) 📝",
        grounding: "Pika pika! Shall we do a grounding exercise to feel safe? (Yes / No) 🌿",
        visualization: "Pika! Want to imagine a happy place together? (Yes / No) 🌄",
        sleepSupport: "Pika... sleepy? Want me to help you rest? (Yes / No) 🌙",
        angerRelease: "Chuuuu! Want to release that anger safely? (Yes / No) 🔥",
        stories: "Pika pika! Want to hear a calming story? (Yes / No) 📖",
        games: "Pika! Want to play a riddle game? (Yes / No) 🎮",
        yoga: "Pika! Want to stretch with some Yoga? (Yes / No) 🧘",
        exercise: "Pika Chuu! Want to do a quick workout? (Yes / No) 🏃"
    };
    return questions[featureName] || "Pika? Want to try an activity? (Yes / No)";
}

// --- START A FEATURE ---
function startFeature(featureName) {
    const feature = features[featureName];
    if (!feature) {
        conversationState.awaitingConsent = false;
        return "Pika? I don't know that one yet! ⚡";
    }

    conversationState.awaitingConsent = false;
    conversationState.currentFeature = featureName;
    conversationState.featureStep = 0;

    // For writing feature, just return the prompt
    if (featureName === 'writing') {
        return feature.prompt;
    }

    // For stories, just return one story
    if (featureName === 'stories') {
        const story = feature.content[Math.floor(Math.random() * feature.content.length)];
        return story + "\n\nI hope that brought you a moment of peace 🌿. Would you like another one, or something else?";
    }

    // For games, start a riddle
    if (featureName === 'games') {
        const riddle = feature.riddles[Math.floor(Math.random() * feature.riddles.length)];
        conversationState.gameRiddle = riddle;
        return "Pika! Here is your riddle: \n\n" + riddle.q + "\n\n(Guess it! Or say 'give up')";
    }

    // For step-based features, return first step
    if (feature.steps && feature.steps.length > 0) {
        return feature.steps[0] + "\n\n(Say 'next' or 'continue' when ready, or 'stop' to end)";
    }

    return "Pika! Let's start... ⚡";
}

// --- HANDLE ACTIVE FEATURE ---
function handleActiveFeature(userInput) {
    const cleanInput = userInput.toLowerCase().trim();
    const feature = features[conversationState.currentFeature];

    // Check for stop/exit commands
    if (cleanInput.includes('stop') || cleanInput.includes('exit') || cleanInput.includes('quit') || cleanInput.includes('end')) {
        return endFeature("Pika! Stopped! I'm here whenever you need me 🌿");
    }

    // Handle Writing Feature (special case - user writes something)
    if (conversationState.currentFeature === 'writing') {
        // User has written something - acknowledge it
        const acknowledgment = feature.acknowledgments[Math.floor(Math.random() * feature.acknowledgments.length)];
        return endFeature(acknowledgment + "\n\nIs there anything else you'd like to share or talk about?");
    }

    // Handle Stories (User might ask for another)
    if (conversationState.currentFeature === 'stories') {
        if (cleanInput.includes('yes') || cleanInput.includes('another') || cleanInput.includes('more')) {
            const story = feature.content[Math.floor(Math.random() * feature.content.length)];
            return story + "\n\n(Say 'stop' when you're done listening)";
        }
        return endFeature("Pika! I'm glad you listened. How do you feel now? 🌸");
    }

    // Handle Games (Riddles)
    if (conversationState.currentFeature === 'games') {
        const currentRiddle = conversationState.gameRiddle;

        if (cleanInput.includes('give up') || cleanInput.includes('dunno') || cleanInput.includes('tell me')) {
            const answer = "The answer was: " + currentRiddle.a + " 🌟\n\nWould you like another riddle? (Yes / No)";
            // We stay in the feature, but wait for yes/no for NEXT riddle in this same block?
            // Actually, simplest is to reset riddle state or ask for next.
            // Let's reset riddle so next input checks for 'yes'
            conversationState.gameRiddle = null;
            return answer;
        }

        // Check if user is answering a riddle
        if (currentRiddle) {
            if (cleanInput.includes(currentRiddle.a)) {
                conversationState.gameRiddle = null;
                return "Pika! Correct! 🎉 The answer is " + currentRiddle.a + ". ⚡\n\nWant another riddle? (Yes / No)";
            } else {
                return "Pika... not quite! 🧐 Try again, or say 'give up'.";
            }
        } else {
            // User entered something after finishing a riddle (expecting yes/no for another)
            if (yesKeywords.some(w => cleanInput.includes(w))) {
                const riddle = feature.riddles[Math.floor(Math.random() * feature.riddles.length)];
                conversationState.gameRiddle = riddle;
                return "Pika! Here's the next one: \n\n" + riddle.q;
            } else {
                return endFeature("Pika! That was fun! 🎮 Let's play again later. Chuu~");
            }
        }
    }

    // Handle Step-based Features
    if (feature.steps) {
        // Check for next/continue commands
        const continueKeywords = ['next', 'continue', 'okay', 'ok', 'done', 'ready', 'go', 'yes', 'proceed'];
        const shouldContinue = continueKeywords.some(word => cleanInput.includes(word)) || cleanInput.length < 30;

        if (shouldContinue || conversationState.featureStep === 0) {
            conversationState.featureStep++;

            if (conversationState.featureStep >= feature.steps.length) {
                // Feature complete
                return endFeature(feature.steps[feature.steps.length - 1]);
            }

            const isLastStep = conversationState.featureStep === feature.steps.length - 1;
            const stepContent = feature.steps[conversationState.featureStep];

            if (isLastStep) {
                return endFeature(stepContent);
            }

            return stepContent + "\n\n(Say 'next' when ready, or 'stop' to end)";
        }

        // User said something else during the feature - acknowledge and continue
        return "I hear you 🌿 " + feature.steps[conversationState.featureStep] + "\n\n(Say 'next' when ready, or 'stop' to end)";
    }

    return endFeature("Pika! Exercise complete! 🌟 How do you feel now? Chuu~");
}

// --- END FEATURE ---
function endFeature(message) {
    conversationState.currentFeature = null;
    conversationState.featureStep = 0;
    conversationState.lastOffer = null;
    conversationState.gameRiddle = null;
    return message;
}

// --- GET NO RESPONSE ---
function getNoResponse() {
    const noResponses = [
        "Pika! That's okay 🌿 I'm here if you need me! Chuu~",
        "No problem! Pika pika 💙 What else is on your mind?",
        "Okay! Pika! I'm listening... 🌸",
        "Pika... understood! 💛 We can just talk!",
        "Chuu~ Okay! Let me know if you need anything else! ✨"
    ];
    return noResponses[Math.floor(Math.random() * noResponses.length)];
}

// --- 4. THE SPEAK FUNCTION ---
function speak(text) {
    if (!synth) return;
    // Cancel currently playing audio to avoid overlap
    if (synth.speaking) synth.cancel();

    // Clean text for speech (remove emojis somewhat, and repeated chars)
    // Remove complex emojis range
    let cleanText = text.replace(/([#*]+)/g, '') // remove markdown
        .replace(/[^\x00-\x7F]/g, "") // simple way to remove all non-ascii including emojis
        .replace(/\n+/g, '. ');

    if (!cleanText.trim()) return;

    const utterThis = new SpeechSynthesisUtterance(cleanText);

    // VOICE SELECTION
    let voices = synth.getVoices();

    // Function to select voice
    const selectVoice = () => {
        voices = synth.getVoices();

        // Priority: Female/Neural -> Google -> Microsoft -> Any English
        const priorities = [
            v => v.name.includes("Google US English"),
            v => v.name.includes("Female"),
            v => v.name.includes("Zira"),
            v => v.lang === "en-US",
            v => v.lang.startsWith("en")
        ];

        let chosenVoice = null;
        for (let check of priorities) {
            chosenVoice = voices.find(check);
            if (chosenVoice) break;
        }

        if (chosenVoice) {
            utterThis.voice = chosenVoice;
            console.log("Selected voice:", chosenVoice.name);
        } else {
            console.log("No specific voice found, using default.");
        }

        // PARAMETERS - FIX: PITCH MUST BE 0-2 (1 is default)
        utterThis.pitch = 1.3; // Slightly higher for "Pikachu" vibe but valid
        utterThis.rate = 1.1;  // Slightly faster

        synth.speak(utterThis);
    };

    if (voices.length === 0) {
        // Voices not loaded yet
        synth.onvoiceschanged = () => {
            // Avoid multiple triggers
            synth.onvoiceschanged = null;
            selectVoice();
        };
    } else {
        selectVoice();
    }
}

// --- 5. THE INTERFACE CONNECTION ---
function handleProcessInput(userText) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Show User Message
    chatContainer.innerHTML += `<div class="user-msg"><b>You:</b> ${userText}</div>`;

    // Process through Life Architect first
    let botReply = processLifeArchitectCommand(userText);

    // If Life Architect didn't handle it, use the Stress Relief Bot content
    if (!botReply) {
        botReply = getChatbotResponse(userText);
    }

    // Show Bot Message after short delay
    setTimeout(() => {
        // Format the response with proper line breaks for HTML
        const formattedReply = botReply.replace(/\n/g, '<br>');
        chatContainer.innerHTML += `<div class="bot-msg"><b>Bot:</b> ${formattedReply}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        speak(botReply);
    }, 500);
}

// --- LIFE ARCHITECT PARSER ---
function processLifeArchitectCommand(input) {
    const cleanInput = input.trim();
    const lowerInput = cleanInput.toLowerCase();

    // 1. HELP / HEALING
    if (lowerInput.includes('healing') || lowerInput.includes('mental health')) {
        return "🌿 **Healing & Mindfulness**\n\nI can help you with:\n- **Mood Tracking** (How are you feeling?)\n- **Gratitude Journaling** (Type 'I am grateful for...')\n- **Breathing Exercises** (Type 'breathe')\n- **Venting** (Just start typing)\n\nWhat do you need right now?";
    }

    // 2. TASK MANAGER / BUCKET LIST
    // Trigger: "Add [X] to my bucket list"
    if (lowerInput.includes('add') && lowerInput.includes('bucket list')) {
        const item = cleanInput.replace(/add/i, '').replace(/to my bucket list/i, '').replace(/to bucket list/i, '').trim();
        if (item) {
            lifeArchitectState.tasks.push({ type: 'goal', content: item });
            saveLifeState();
            return `✅ Added **"${item}"** to your **Bucket List** (Long-Term Goals).\n\nAnything else?`;
        }
    }

    // Trigger: "Task Manager"
    if (lowerInput === 'task manager' || lowerInput === 'show tasks') {
        if (lifeArchitectState.tasks.length === 0) {
            return "📁 **Task Manager**\n\nYour list is empty. Start by saying 'Add [Goal] to my bucket list'.";
        }
        const goals = lifeArchitectState.tasks.filter(t => t.type === 'goal').map(t => `• 🌟 ${t.content}`).join('\n');
        const tasks = lifeArchitectState.tasks.filter(t => t.type === 'task').map(t => `• ☑️ ${t.content}`).join('\n');

        let msg = "📁 **Task Manager**\n\n";
        if (goals) msg += "**Bucket List:**\n" + goals + "\n\n";
        if (tasks) msg += "**Tasks:**\n" + tasks;

        return msg.trim();
    }

    // 3. DAY PLANNER
    // Trigger: "Put [X] on my schedule" / "Add [X] to my planner"
    if ((lowerInput.includes('put') && lowerInput.includes('schedule')) || (lowerInput.includes('add') && lowerInput.includes('planner'))) {
        const item = cleanInput.replace(/put/i, '').replace(/on my schedule/i, '').replace(/add/i, '').replace(/to my planner/i, '').replace(/to planner/i, '').trim();
        if (item) {
            lifeArchitectState.planner.push({ content: item, completed: false });
            saveLifeState();
            return `📅 Added **"${item}"** to your **Day Planner**.\n\nAnything else?`;
        }
    }

    // Trigger: "Day Planner"
    if (lowerInput === 'day planner' || lowerInput === 'my schedule') {
        if (lifeArchitectState.planner.length === 0) {
            return "📅 **Day Planner**\n\nYour schedule is clear. Add items by saying 'Put [Meeting] on my schedule'.";
        }
        const schedule = lifeArchitectState.planner.map((t, i) => `• ${t.content}`).join('\n');
        return `📅 **Day Planner**\n\n${schedule}`;
    }

    // 4. HABIT TRACKER
    if (lowerInput === 'habit tracker' || (lowerInput.includes('track') && lowerInput.includes('habit'))) {
        return "🔄 **Habit Tracker**\n\n(This is a simple placeholder. Tell me a habit to track like 'Add Drink Water to habits')";
    }
    if (lowerInput.includes('add') && lowerInput.includes('habit')) {
        const item = cleanInput.replace(/add/i, '').replace(/to habits/i, '').replace(/habit/i, '').trim();
        lifeArchitectState.habits.push(item);
        saveLifeState();
        return `🔄 Added **"${item}"** to your **Habit Tracker**.\n\nAnything else?`;
    }

    // 5. OFFLINE SECTION
    if (lowerInput.includes('offline section') || lowerInput.includes('offline booking')) {
        return "🏋️ **Offline Section**\n\nUse this for gym times, doctor visits, etc. Just say 'Book [Event]'.";
    }
    if (lowerInput.startsWith('book ')) {
        const item = cleanInput.replace(/book/i, '').trim();
        lifeArchitectState.offline.push(item);
        saveLifeState();
        return `📍 Booked **"${item}"** in your **Offline Section**.\n\nAnything else?`;
    }

    // 6. IDEA VAULT
    if (lowerInput.includes('idea vault') || lowerInput.includes('save idea')) {
        if (lowerInput.includes('save idea')) {
            const item = cleanInput.replace(/save idea/i, '').trim();
            lifeArchitectState.ideas.push(item);
            saveLifeState();
            return `💡 Saved to **Idea Vault**: "${item}".\n\nAnything else?`;
        }
        if (lifeArchitectState.ideas.length === 0) return "💡 **Idea Vault** is empty. Say 'Save idea [My Idea]'.";
        return "💡 **Idea Vault**\n\n" + lifeArchitectState.ideas.map(i => `• ${i}`).join('\n');
    }

    // 7. VOICE NOTES
    if (lowerInput.includes('voice note') || lowerInput.includes('record note')) {
        if (lowerInput.includes('save') || lowerInput.includes('add')) {
            const note = cleanInput.replace(/save/i, '').replace(/add/i, '').replace(/voice note/i, '').replace(/note/i, '').trim();
            if (note) {
                lifeArchitectState.voiceNotes.push({ content: note, date: new Date().toLocaleString() });
                saveLifeState();
                return `🎤 Saved your **Voice Note**: "${note}"\n\nYou can see it in your Voice Vault!`;
            }
        }
        return "🎤 **Voice Notes**\n\nI can record your thoughts! Just say 'Save voice note [Your Message]' or 'Take a voice note'. (Transcriped via mic)";
    }

    // 8. SHOW DASHBOARD / POPUP
    if (lowerInput.includes('task manager') || lowerInput.includes('dashboard') || lowerInput.includes('show all')) {
        showLifeArchitectPopup();
        return "📲 I've opened your Life Architect Dashboard! You can see all your lists there.";
    }

    return null; // Passes control back to the emotional bot
}

// --- POPUP UI LOGIC ---
function showLifeArchitectPopup() {
    const popup = document.getElementById('life-popup');
    if (!popup) return;

    // Populate Lists
    renderList('popup-planner-list', lifeArchitectState.planner.map(i => i.content));

    // Combine Goals and Tasks for the main view
    const allTasks = lifeArchitectState.tasks.map(t => (t.type === 'goal' ? '🌟 ' : '☑️ ') + t.content);
    renderList('popup-tasks-list', allTasks);

    renderList('popup-habits-list', lifeArchitectState.habits);
    renderList('popup-ideas-list', lifeArchitectState.ideas);
    renderList('popup-offline-list', lifeArchitectState.offline);
    renderList('popup-voice-list', lifeArchitectState.voiceNotes.map(n => `${n.content} (${n.date})`));

    popup.classList.remove('hidden');
}

function closePopup() {
    const popup = document.getElementById('life-popup');
    if (popup) popup.classList.add('hidden');
}

function renderList(elementId, items) {
    const list = document.getElementById(elementId);
    if (!list) return;
    list.innerHTML = "";

    if (items.length === 0) {
        list.innerHTML = "<li style='color:#ccc; font-style:italic;'>Empty...</li>";
        return;
    }

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${item}`;
        list.appendChild(li);
    });
}


// Button Trigger
function handleSendMessage() {
    const inputField = document.getElementById('user-input');
    if (!inputField || inputField.value.trim() === "") return;
    handleProcessInput(inputField.value);
    inputField.value = "";
}

// Mic Trigger
function startListening() {
    if (recognition) {
        try {
            recognition.start();
            console.log("Listening...");
        } catch (e) {
            console.error("Already engaged", e);
            // Maybe stop and restart?
        }
    } else {
        alert("Your browser does not support voice input.");
    }
}

// --- 8. STARTUP GREETING ---
window.onload = function () {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        // Initial Greeting & Menu
        const greeting = "Pika Pika! 👋 I am Pikachu! How are you feeling today? ✨";
        const menu = "Here is what we can do together:\n\n1. 🗣️ **Chat with me**\n2. 📖 **Listen to Stories**\n3. 🎮 **Play Games**\n4. 🧘 **Do Yoga**\n5. 🏃 **Exercise**\n6. 🌬️ **Breathing Exercises**\n7. 🌿 **Grounding**\n8. ✍️ **Journaling**\n\nJust type what you want! Chuu~";

        const fullMessage = greeting + "\n\n" + menu;

        // Display in Chat
        // We use innerHTML += to append, ensuring we catch the user's eye
        chatContainer.innerHTML += `<div class="bot-msg"><b>Bot:</b> ${greeting}</div>`;

        // Slight delay for the menu to appear 'naturally' or just append it immediately. 
        setTimeout(() => {
            const formattedMenu = menu.replace(/\n/g, '<br>');
            chatContainer.innerHTML += `<div class="bot-msg"><b>Bot:</b> ${formattedMenu}</div>`;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 500);

        // Speak the greeting and menu
        // Trigger speech (might be blocked by autoplay policy)
        setTimeout(() => speak(greeting + ". " + menu), 1000);
    }

    // Theme Init
    initTheme();
};

// --- CLEANUP ON EXIT ---
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

