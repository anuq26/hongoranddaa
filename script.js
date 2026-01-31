// =================== ELEMENTS ===================
const nameEl = document.getElementById("name");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const card = document.getElementById("card");
const heartsLayer = document.getElementById("hearts");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const msg = document.getElementById("msg");

// =================== NAME FROM LINK ===================
// example: index.html?name=Anu
const params = new URLSearchParams(window.location.search);
const nm = params.get("name");
if (nm) nameEl.textContent = nm;

// =================== HELPERS ===================
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

// =================== NO: PLACE NEXT TO YES (START) ===================
function placeNoNextToYes() {
    // "buttons" wrapper дотор absolute байрлал ашиглана
    const wrap = document.querySelector(".buttons");
    const wrapRect = wrap.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    // Yes-ийн баруун талд 22px зайтай байрлуулна
    const x = (yesRect.left - wrapRect.left) + yesRect.width + 22;
    const y = 24; // buttons дээрх өндөр

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;

    // Wrap-оос гарахгүй clamp
    const maxX = wrapRect.width - noRect.width;
    const maxY = wrapRect.height - noRect.height;
    noBtn.style.left = `${clamp(x, 0, maxX)}px`;
    noBtn.style.top = `${clamp(y, 0, maxY)}px`;
}

// =================== NO RUNAWAY (PLAYFUL) ===================
const TRIGGER_DISTANCE = 95; // px ойртмогц зугтана
let cooldown = false;

function randomNoPositionInButtons() {
    const wrap = document.querySelector(".buttons");
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // buttons дотор үлдээнэ (padding үлдээнэ)
    const padding = 8;
    const minX = padding;
    const maxX = wrapRect.width - btnRect.width - padding;

    const minY = 10;
    const maxY = wrapRect.height - btnRect.height - 10;

    // илүү "playful" болгохын тулд pointer-оос эсрэг тал руу түлхэц өгье
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    noBtn.style.left = `${clamp(x, minX, maxX)}px`;
    noBtn.style.top = `${clamp(y, minY, maxY)}px`;
}

function runawayIfNearPointer(clientX, clientY) {
    if (cooldown || noBtn.disabled) return;

    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    if (dist(clientX, clientY, cx, cy) > TRIGGER_DISTANCE) return;

    cooldown = true;
    randomNoPositionInButtons();
    setTimeout(() => (cooldown = false), 90);
}

// mouse хөдөлмөгц (card дээр) шалгана
card.addEventListener("mousemove", (e) => runawayIfNearPointer(e.clientX, e.clientY));

// backup — яг No дээр хүрэхэд шууд үсэрнэ
noBtn.addEventListener("mouseenter", () => {
    if (noBtn.disabled) return;
    randomNoPositionInButtons();
});

// mobile
card.addEventListener("touchmove", (e) => {
    if (noBtn.disabled) return;
    const t = e.touches[0];
    runawayIfNearPointer(t.clientX, t.clientY);
}, { passive: true });

// =================== NO CLICK MESSAGE ===================
noBtn.addEventListener("click", () => {
    if (noBtn.disabled) return;
    if (msg) {
        msg.textContent = "Nice try 😼 but try again";
        // 1.5 секунд дараа арилгана
        setTimeout(() => {
            msg.textContent = "";
        }, 1500);
    }
});

// =================== PARTICLES (🗿 + FIREWORK) ===================
function spawnParticles({ x, y, count = 24, spreadX = 160, spreadY = 50, emojis = ["🗿"] }) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "heart-float";
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const jitterX = (Math.random() - 0.5) * spreadX;
        const jitterY = (Math.random() - 0.5) * spreadY;

        el.style.left = `${x + jitterX}px`;
        el.style.top = `${y + jitterY}px`;

        heartsLayer.appendChild(el);
        el.addEventListener("animationend", () => el.remove());
    }
}

function spawnFireworks() {
    const cardRect = card.getBoundingClientRect();
    const fireEmojis = ["✨", "🎆", "🎇", "🎉", "💥"];
    const bursts = 5;

    for (let b = 0; b < bursts; b++) {
        const x = 80 + Math.random() * (cardRect.width - 160);
        const y = 90 + Math.random() * 200;

        spawnParticles({
            x,
            y,
            count: 30,
            spreadX: 260,
            spreadY: 90,
            emojis: fireEmojis,
        });
    }
}

// =================== YES CLICK (HIDE BUTTONS + HINT) ===================
yesBtn.addEventListener("click", () => {
    const cardRect = card.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const originX = yesRect.left - cardRect.left + yesRect.width / 2;
    const originY = yesRect.top - cardRect.top + yesRect.height / 2;

    spawnParticles({ x: originX, y: originY, count: 40, spreadX: 240, spreadY: 70, emojis: ["🗿"] });
    spawnFireworks();

    // UI hide
    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    if (hint) hint.style.display = "none";
    if (msg) msg.style.display = "none";

    // Result text only
    result.hidden = false;
    const bigHeart = result.querySelector(".big");
    if (bigHeart) bigHeart.style.display = "none";
});

// =================== INIT ===================
window.addEventListener("load", () => {
    // No-гийн CSS нь position:absolute байх ёстой (доорх тэмдэглэл)
    placeNoNextToYes();
});
window.addEventListener("resize", () => placeNoNextToYes());
