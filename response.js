const responses = {
    // � MENU / OPTIONS
    menu: {
        keywords: [
            "menu", "what can you do", "show options", "list", "options", "features", "capabilities",
            "help me", "what do you do"
        ],
        replies: [
            "Pika! Here is what I can do for you! ⚡\n\n1. 🧘 **Yoga** (Type 'Yoga')\n2. 🏃 **Exercise** (Type 'Exercise')\n3. 🌬️ **Breathing** (Type 'Breathe')\n4. 🎮 **Games** (Type 'Play Game')\n5. 📖 **Stories** (Type 'Story')\n6. 🌿 **Grounding** (Type 'Grounding')\n7. ✍️ **Journaling** (Type 'Writing')\n8. 🛌 **Sleep Help** (Type 'Sleep')\n\nChuu~ What would you like to try? ✨",
            "Pika Pika! Look at all these fun things! 🌟\n\n- Yoga 🧘\n- Quick Workout 🏃\n- Breathing Exercises 🌬️\n- Riddles 🎮\n- Calming Stories 📖\n\nJust tell me what you want! Chuu! ⚡"
        ]
    },

    // �👋 GREETINGS / OPENING APP
    greeting: {
        keywords: [
            "hi", "hello", "hey", "namaste", "namaskar", "pranam", "good morning", "good afternoon", "good evening",
            "yo", "hola", "hello there", "hey buddy", "starting my day", "opening app", "just checking in",
            "kaise ho", "kya haal hai", "vanakkam", "salaam", "adaab", "ram ram", "jai shree ram", "hey there",
            "hi buddy", "sat sri akal", "kem cho", "nomoshkar", "ka haal chaal", "sab theek", "aur batao",
            "came to talk", "here again", "back again", "first time here", "new here"
        ],
        replies: [
            "Pika! Hello! 🌱 How are you feeling right now? Chuu~",
            "Pika Pika! I'm so happy you're here! ✨ How are you feeling today?",
            "Chuu~ Hi there! 😊 Take a breath... Pika... how is your mood?",
            "Namaste! 🙏 Pika! Let's check in with your heart. How do you feel?",
            "Pika! Hey! 🌸 Before we play, tell me—how are you?",
            "Welcome back! Pikaaaa! 💙 What's on your mind?",
            "Pika! Good to see you! 🙂 How has your day been?",
            "Hello again! 🌿 Pika! Want to share how you're feeling?",
            "Hi! 🌼 Let's start gently. Pika... how are you doing?",
            "Hey buddy! 👋 Pika Pika! What's your mood like?",
            "Namaskar! 🌺 Pika is here with you! How are things inside?",
            "Welcome! 🌱 No rush... Pika... how are you feeling?",
            "Hello! ☀️ Pika! Starting fresh? Tell me how you feel!",
            "Hey there! 🤍 Pika is listening. What's wrong?",
            "Good day! 🌸 Pika! Want to do a quick check-in?",
            "Hi! 🙌 Pika! Good or heavy, you can share it here. Chuu~"
        ]
    },

    // 😊 POSITIVE / GOOD MOOD
    positive: {
        keywords: [
            "happy", "good", "great", "awesome", "fantastic", "calm", "relaxed", "peaceful", "content",
            "fine", "okay", "all good", "feeling nice", "energetic", "motivated", "fresh", "positive",
            "excited", "hopeful", "feels good", "doing well", "light", "balanced", "cheerful", "smiling",
            "in a good mood", "feeling better", "stable", "mind is calm", "everything fine", "doing okay"
        ],
        replies: [
            "Pika! That’s wonderful! 😊 What shall we do next? Chuu~",
            "Pika Pika! Yay! That makes me happy too! ✨ Want to do something fun?",
            "Chuu~ I'm glad you're good! 🌸 Want to keep this vibe going?",
            "Pikaaaa! Love that energy! ⚡ What do you want to explore?",
            "It's great that you're calm! 🌿 Pika! Want to stay relaxed?",
            "That's wonderful! 💛 Pika! Want a small happy activity?",
            "Nice! 🙂 Pika! Want to reflect on this good feeling?",
            "Feeling good is precious! 🌼 Pika! Want to build on it?",
            "That’s a healthy headspace! 🌱 Pika! Shall we do something light?",
            "Awesome! 😄 Pika Pika! Plan your day or just relax?",
            "I’m happy to hear that! 💙 Pika! Want to lock in this mood?",
            "That sounds peaceful... 🌊 Pika... Enjoy the calm!",
            "Great! 🌞 Pika! What should we focus on next?",
            "Good to hear! 😊 Pika! Want to check in or chill?",
            "Lovely! 🌸 Pika! Want to say 'Thank You' to the universe?",
            "That’s a nice place to be! 💫 Pika! How shall we continue?"
        ]
    },

    // 😐 NORMAL / DAILY LIFE
    normalDay: {
        keywords: [
            "normal", "same as usual", "nothing special", "just another day", "routine", "average",
            "okay okay", "ok ok", "chal raha hai", "bas chal raha hai", "life is going", "life goes on",
            "usual stuff", "daily work", "everyday work", "regular day", "office", "at office",
            "office work", "college", "class", "lectures", "school", "homework", "assignments",
            "busy day", "little busy", "free today", "no plans", "nothing much", "not much",
            "as usual", "same old", "just normal", "routine life", "home work"
        ],
        replies: [
            "Pika! Got it! 🙂 Want to relax a little? Chuu~",
            "Just a regular day? Pika! Want to pause for a second?",
            "Sounds like an average day. 🌿 Pika! Need a break?",
            "That’s okay—normal days are good too! 😊 Pika!",
            "Understood! 🙂 Pika! Want to unwind?",
            "A usual day... 🌸 Pika! Interested in a quick activity?",
            "Alright! 🌱 Pika! Want a mental snack?",
            "Nothing special is still something! 🙂 Pika! Check in?",
            "Gotcha! Pika! Slow down for a minute?",
            "Sounds steady! 🙂 Pika! Want to keep it easy?",
            "Fair enough! 🌿 Pika! Want a gentle activity?",
            "Okay! 🙂 Pika! Add a little calm to your day?",
            "Just another day—Pika! Make it lighter?",
            "Thanks for sharing! 🙂 Pika! What next?",
            "Normal and steady! 🌱 Pika! Do a small reset?",
            "All good! 🙂 Pika is here if you want to talk! Chuu~"
        ]
    },

    // 😮‍💨 MILD STRESS / TIRED
    mildStress: {
        keywords: [
            "tired", "sleepy", "exhausted", "drained", "overthinking", "busy", "too much work",
            "pressure", "headache", "lazy", "burnt out", "mentally tired", "low energy",
            "feeling heavy", "confused", "restless"
        ],
        replies: {
            "default": "Pika... I hear you. Chuu~ Want to breathe with me?",
            "tired": "Pika... Tired? 😌 Close eyes... breathe... Chuu~",
            "sleepy": "Sleepy? 💤 Pika! Stretch your arms! Or sip water! ✨",
            "exhausted": "Exhausted? 🌿 Pika... Lie down... relax body... Chuu~",
            "drained": "You seem drained 🪷 Pika! Let's breathe for 3 minutes.",
            "overthinking": "Overthinking? 🌀 Pika! Pause! Breathe In... Out...",
            "busy": "Busy busy? ⏳ Pika! Take a break! Stretch! Look outside!",
            "too much work": "Work overload? 😓 Pika! Step back. Close eyes. Breathe.",
            "pressure": "Pressure? 🌿 Pika! Try box breathing. 4-4-4-4. Chuu~",
            "headache": "Headache? 💆‍♂️ Pika... Rest eyes. Massage temples. Breathe.",
            "lazy": "Feeling lazy? 😌 Pika! That's okay! Stretch a little! ⚡",
            "burnt out": "Burnt out? 🕊️ Pika! Fresh air! Go outside! Breathe.",
            "mentally tired": "Brain tired? 🧠 Pika... Visualize a beach... Chuu~",
            "low energy": "Low energy? 🌞 Pika! Water! Stretch! Deep breath!",
            "feeling heavy": "Heavy? 🪷 Pika! Breathe in light... exhale heavy...",
            "confused": "Confused? 🌿 Pika! Pause. One thing at a time.",
            "restless": "Restless? 🌀 Pika! Stand up! Shake arms! Shake legs!"
        }
    },

    // 😰 HIGH STRESS / PANIC
    highStress: {
        keywords: [
            "anxious", "stressed", "panic", "panicking", "overwhelmed", "scared", "nervous",
            "can't breathe", "heart racing", "breaking down", "losing control", "too much stress",
            "mental pressure"
        ],
        replies: {
            "default": "Pika! I'm here! 🤍 Slow down... breathe with me. Chuu~",
            "anxious": "You're not alone! Pika! Inhale nose... 4 sec... Exhale mouth... Chuu~",
            "stressed": "So much stress... Pika... Pause. Breathe deep. Listen to a song? 🎶",
            "panic": "You are SAFE. Pika! Ground yourself. Name 3 things you see. 👀",
            "panicking": "Pika! Breathe! Inhale 4... Exhale 6... Look around. You are safe. 🌿",
            "overwhelmed": "Too much? Pika... Pause. Breathe slow. Write it down? 📝",
            "scared": "Scared? Pika! Close eyes. Safe place. Breathe... Chuu~ 🤍",
            "nervous": "Nervous? Pika! Ground yourself! 5 things you see! Quick! 👀",
            "can't breathe": "Pika! You can breathe! Slowly... Inhale 4... Exhale 6... Steady... 🍃",
            "heart racing": "Heart fast? Pika... Slow it down. Breathe in gentle... Exhale long... 🌸",
            "breaking down": "Pika... it's okay. Cry if you need. Hug yourself. Chuu~ 💙",
            "losing control": "Pika! Hand on heart. Breathe. You are here. You are safe. 🌿",
            "too much stress": "Pika! Too much! 🛑 Pause. Breathe deep. Let it go... 🍃",
            "mental pressure": "Pressure... Pika... Breathe in... Out... Write one worry. 📝"
        }
    },

    // 😞 LOW MOOD / SAD
    lowMood: {
        keywords: [
            "sad", "lonely", "empty", "hopeless", "down", "low","die", "depressed", "crying",
            "like crying", "feeling alone", "no one understands", "worthless", "demotivated",
            "lost", "numb"
        ],
        replies: {
            "default": "Pika... Thank you for telling me. I'm here. 🤍",
            "sad": "Pika... Sad? 💛 That's okay. Breathe deep. Hug? Chuu~",
            "lonely": "You're not alone! Pika is here! 🤍 Talk to me. ✨",
            "empty": "Empty? 💫 Pika... Look at a color. Listen to a sound. Feel life. 🌿",
            "hopeless": "Pika... I know. But hope is there. Breathe. Focus on now. 💙",
            "down": "Feeling down? 🌱 Pika... Stretch gently. Look at the sky. ☁️",
            "low": "Low? 💛 Pika... Quiet time. Warm tea? Soothing song? 🎶",
            "depressed": "Pika... You're not alone. 🤍 Write one thought? It helps. 📝",
            "crying": "Cry... it's okay. 💧 Pika... Let it out. You are safe. 🌸",
            "like crying": "Want to cry? 🌸 Pika... It's okay. Breathe gently. Chuu~",
            "feeling alone": "Pika is here! 💙 You are not alone. Focus on something comfy. 🧸",
            "no one understands": "Pika understands! 🌿 Share with me. I listen. Chuu~",
            "worthless": "No! You are precious! 💛 Pika! Name one small good thing you did. ✨",
            "demotivated": "No motivation? 🌱 Pika! Do just ONE small thing. Tiny step! 🦶",
            "lost": "Lost? 💫 Pika... Breathe. Just do the next small thing. 🧭",
            "numb": "Numb? 🌿 Pika... Touch something. Pinch yourself gently. You are here."
        }
    },

    // 😠 ANGER / FRUSTRATION
    anger: {
        keywords: [
            "angry", "irritated", "frustrated", "annoyed", "fed up", "mad", "rage",
            "furious", "pissed", "can't tolerate", "had enough"
        ],
        replies: {
            "default": "Pika! Sounds intense! � Want to vent? Chuu~",
            "angry": "Pika! Angry? 😤 Breathe deeply! Exhale hard! Shake hands! 👋",
            "irritated": "Irritated? 🌿 Pika... Pause. Inhale slow. Look at something calm. 🌸",
            "frustrated": "Frustrated? 😔 Pika... Write it down! Or walk! 🚶‍♂️",
            "annoyed": "Annoyed? 💛 Pika... Step back. Breathe. Ignore it. 🍃",
            "fed up": "Fed up? 💙 Pika! Breathe deep. Ground yourself. 5 things you see. 👀",
            "mad": "Mad? 🌱 Pika! Squeeze a pillow! Breathe! 🧸",
            "rage": "Rage! 💫 Pika! Slow steady breaths. Let it out. 🌬️",
            "furious": "Furious? 😌 Pika! Clench fists... release... Breathe. ✊",
            "pissed": "Pissed? 🌿 Pika! Go outside! Fresh air! Move your body! 🏃",
            "can't tolerate": "Hard to tolerate? 💛 Pika... Pause. Breathe. Write one bother. 📝",
            "had enough": "Enough! 😌 Pika! Slow breaths. Sip water. Stretch. 💧"
        }
    },

    // 😴 SLEEP / NIGHT TALK
    sleep: {
        keywords: [
            "sleepy", "can't sleep", "insomnia", "late night", "night thoughts",
            "need rest", "want to sleep", "feeling drowsy", "bed time"
        ],
        replies: {
            "default": "Pika... Sleep time? 🌙 Want me to help? Chuu~",
            "sleepy": "Sleepy? 😌 Pika... Close eyes. Deep breaths. Relax... 💤",
            "can't sleep": "Can't sleep? 🌙 Pika... Visualize a cloud... Float... ☁️",
            "insomnia": "Insomnia? 💛 Pika! Try 4-7-8 breathing. In 4, Hold 7, Out 8. 🌬️",
            "late night": "Late! 🌌 Pika... Breathe deep. Let thoughts go... 🍃",
            "night thoughts": "Thoughts? 💤 Pika... Write them down. Or blow them away. 🌬️",
            "need rest": "Need rest? 🌿 Pika... Lie down. Close eyes. Calm mind. 🌸",
            "want to sleep": "Want sleep? 🌙 Pika! Count backwards from 50... Slow... 📉",
            "feeling drowsy": "Drowsy... 😴 Pika! Relax fully. Goodnight... Chuu~",
            "bed time": "Bedtime! 🌌 Pika! Dim lights. Deep breaths. Sweet dreams! ⭐"
        }
    },

    // 🌟 AFFIRMATIONS
    affirmation: {
        keywords: [
            "affirmation", "positive thought", "need strength", "encourage me", "say something nice",
            "give me hope", "i feel weak", "need positivity", "boost my morale"
        ],
        replies: [
            "Pika! You are stronger than you know! 💛 Chuu~",
            "You are capable! You are resilient! Pika pika! 🌿",
            "Breathe in confidence... Pika... Breathe out doubt. ✨",
            "Your feelings are valid! Pika loves you! 💙",
            "One step at a time! Pika! Be gentle with yourself. 🌱",
            "You survived 100% of bad days! Pika! Keep going! 🌻"
        ]
    },

    // 🚀 MOTIVATION
    motivation: {
        keywords: [
            "motivate me", "need motivation", "inspire me", "feel stuck", "lazy", "give me energy",
            "push me", "i can't do it", "too hard", "give up"
        ],
        replies: [
            "Pika! Believe you can! You're halfway there! 🚀",
            "Slow is okay! Just don't stop! Pika pika! 🐢",
            "Love what you do! Great work! Pika! 💡",
            "Don't watch the clock! Pika! Keep moving! ⏰",
            "Dream big! Pika! You are amazing! 🌟",
            "Difficult roads lead to beautiful places! Hang in there! Pika! 🏔️"
        ]
    },

    // 📖 STORIES (Trigger)
    story: {
        keywords: [
            "tell me a story", "bedtime story", "read a story", "story time", "short story",
            "calm story", "relaxing story"
        ],
        replies: {
            "default": "Pika! Stories? 📖 I love stories! Chuu~ Want to hear one?",
        }
    },

    // 🎮 GAMES (Trigger)
    game: {
        keywords: [
            "play a game", "bored", "play with me", "riddle", "puzzle", "fun", "entertainment",
            "game", "play"
        ],
        replies: {
            "default": "Pika! Let's play! 🎮 Want a riddle? Chuu~",
        }
    },

    // 🧘 YOGA (Trigger)
    yoga: {
        keywords: [
            "yoga", "do yoga", "stretch", "stretching", "asana", "pose"
        ],
        replies: {
            "default": "Pika! Yoga time? 🧘 Let's stretch! Ready? Chuu~"
        }
    },

    // 🏃 EXERCISE (Trigger)
    exercise: {
        keywords: [
            "exercise", "workout", "gym", "fitness", "move", "training"
        ],
        replies: {
            "default": "Pika! Exercise! 🏃 Let's get moving! Ready? ⚡"
        }
    },

    // ❓ HELP / GUIDANCE
    help: {
        keywords: [
            "help", "support", "guide me", "what should i do", "suggest", "advice", "confused",
            "need help", "can you help", "tell me", "madad", "sahayata", "kya karu",
            "samajh nahi aa raha", "kuch samjhao", "advice do", "guide karo", "help karo"
        ],
        replies: {
            "default": "Pika! I'm here! 💙 Tell me more. Chuu~",
            "help": "Pika! I'm here! What’s on your mind? 💙",
            "support": "I’ve got you! 🌿 Pika! Tell me so I can help.",
            "guide me": "Sure! 🙏 Pika! Step by step together!",
            "what should i do": "Let’s think! 🌱 Pika! Tell me about it?",
            "suggest": "Pika! I have ideas! 💛 What's happening?",
            "advice": "I’m here! 💙 Pika! Let's see what helps.",
            "confused": "Pika... I understand. 🤍 Breathe. We will sort it.",
            "need help": "I’m listening! 🌸 Pika! What do you need?",
            "can you help": "Yes! 💛 Pika is here! What is troubling you?",
            "tell me": "Sure! 🌿 Pika is all ears! Details? 👂",
            "madad": "Bilkul! 💙 Pika madad karega! Kya chahiye?",
            "sahayata": "Main hoon na! 🌱 Pika! Kya zarurat hai?",
            "kya karu": "Chinta mat karo! 🌿 Pika saath hai. Sochte hain.",
            "samajh nahi aa raha": "Koi baat nahi! 🤍 Pika samjhayega. Step by step.",
            "kuch samjhao": "Bilkul! 💛 Pika! Situation batao.",
            "advice do": "Pika advice dega! 🌱 Context batao.",
            "guide karo": "Sure! 🌿 Pika guide karega. Problem kya hai?",
            "help karo": "Zarur! 💙 Pika madad karega. Bataiye!"
        }
    }
};

const fallbackResponse = "Pika? I'm listening... 🌿 Want to talk? Chuu~";
