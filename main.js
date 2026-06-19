
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const hardBtn = document.getElementById("hardBtn"); const lunaticBtn = document.getElementById("lunaticBtn");
let hardCleared = document.cookie.includes("hardCleared=true"); if (hardCleared) lunaticBtn.style.display = "";
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");

const title = document.querySelector(".header > div:first-child");

const output = document.getElementById("output");
const subOutput = document.getElementById("subOutput");
const log = document.getElementById("log");

const resultTitle = document.getElementById("resultTitle");
const answer = document.getElementById("answer");
const resultTries = document.getElementById("resultTries");

const clock = document.getElementById("clock");

// lets

let target = "";
let count = 0;
let digits = 3;
let locked = false;

/* これで初手解放
localStorage.setItem("hardCleared", "true");
lunaticBtn.style.display = "";  // 解放
*/


/* これでリセット
document.cookie = "hardCleared=; path=/; max-age=0";
*/

function setDifficulty(mode) {
    digits = mode === "hard" ? 4 : mode === "lunatic" ? 5 : 3;
}


function initGame() {
    count = 0;
    locked = false;
    log.innerHTML = "";
    target = generateTarget(digits);

    output.textContent = "\u00A0"; //なんか良い空白
    subOutput.textContent = "\u00A0";
}


function generateTarget(d) {
    const max = Math.pow(10, d);
    return String(Math.floor(Math.random() * max)).padStart(d, "0");
}

function getGuessFromTime() {
    const now = Date.now();
    const sec1 = Math.floor(now / 1000) % 10;
    const ms = String(now % 1000).padStart(3, "0");
    const us = Math.floor((performance.now() % 1) * 10);

    if (digits === 3) return `${sec1}${ms.slice(0, 2)}`;
    if (digits === 4) return `${sec1}${ms}`;
    if (digits === 5) return `${sec1}${ms}${us}`;
}

function judge(guess) {

    const t = target.split("");
    const g = guess.split("");

    let hit = 0;
    let blow = 0;

    const usedT = Array(digits).fill(false);
    const usedG = Array(digits).fill(false);

    for (let i = 0; i < digits; i++) {
        if (g[i] === t[i]) {
            hit++;
            usedT[i] = true;
            usedG[i] = true;
        }
    }

    for (let i = 0; i < digits; i++) {
        if (usedG[i]) continue;

        for (let j = 0; j < digits; j++) {
            if (usedT[j]) continue;

            if (g[i] === t[j]) {
                blow++;
                usedT[j] = true;
                break;
            }
        }
    }

    return { hit, blow };
}

function addLog(guess, hit, blow) {

    const item = document.createElement("div");
    item.className = "logItem";

    if (hit >= 2 || (hit === 1 && blow >= 2) || blow >= 3) {
        item.classList.add("high");
    } else if (hit === 1 || blow >= 2) {
        item.classList.add("mid");
    } else if (blow >= 1) {
        item.classList.add("low");
    }
    item.innerHTML =
        `<div class="logIndex">#${count}</div>
         <div class="logGuess">${guess}</div>
         <div class="logResult">${hit}H${blow}B</div>`;

    log.insertBefore(item, log.firstChild);

    while (log.childElementCount > 10) {
        log.removeChild(log.lastElementChild);
    }
}

// 画面制御らへん

function showScreen(screen) {
    startScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    resultScreen.classList.remove("active");

    screen.classList.add("active");
}

// リザルト

function showResult() {

    locked = true;

    if (digits === 4 && !hardCleared) {
        hardCleared = true;
        document.cookie = "hardCleared=true; path=/";
        lunaticBtn.style.display = "";
    }

    crear.textContent = "CLEAR!";
    answer.textContent = `${target}`;
    tries.textContent = `${count} tries`;

    showScreen(resultScreen);
}


function onGuess() {

    if (locked) return;

    const now = Date.now();
    const guess = getGuessFromTime(now);

    const { hit, blow } = judge(guess);

    count++;

    output.textContent = guess;
    subOutput.textContent = `${hit}H${blow}B`;

    addLog(guess, hit, blow);

    if (hit === digits) {
        showResult();
    }
}

let lastClockText = "";

function clockLoop() {

    const now = new Date();

    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(3, "0");

    const text = `${h}:${m}:${s}.${ms}`;

    if (text !== lastClockText) {
        clock.textContent = text;
        lastClockText = text;
    }

    requestAnimationFrame(clockLoop);
}

requestAnimationFrame(clockLoop);

// クリック周り

startBtn.onclick = () => {
    setDifficulty("normal");
    initGame();
    showScreen(gameScreen);
};

hardBtn?.addEventListener("click", () => {
    setDifficulty("hard");
    initGame();
    showScreen(gameScreen);
});

restartBtn.onclick = () => {
    locked = false;
    count = 0;
    log.innerHTML = "";
    output.textContent = "\u00A0";
    subOutput.textContent = "\u00A0";

    showScreen(startScreen);
};

guessBtn.onclick = onGuess;

if (title) {
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
        showScreen(startScreen);
    });
}

lunaticBtn?.addEventListener("click", () => {
    setDifficulty("lunatic");
    initGame();
    showScreen(gameScreen);
});