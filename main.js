function RestartGame()
{
    birdY = center.y;
    birdVelY = 0;
    blockArray = new Array(maxBlockCount()).fill().map(randomHeightProportion);
    totalXOffset = 0;
    gravity = 0;
    birdHorizontalSpeed = 0;
    startTime = Date.now();
    // Renderer();
    RetryModal.close(0);
    document.removeEventListener('click', __fn);

    __currentScore = 0;

    setTimeout(() => {
        document.addEventListener('click', () => {
            gravity = 1000;
            birdHorizontalSpeed = 2;
        }, {once: true});
        document.addEventListener('click', __fn);
    }, 100);
    
    Renderer();
}
document.getElementById('restart-button').addEventListener('click', RestartGame);

const header = document.querySelector('header');
header.addEventListener('click', () => {
    header.ariaPressed = header.ariaPressed === 'true' ? 'false' : 'true';
});

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = canvas.width * (window.innerHeight / window.innerWidth);

const center = {
    x: canvas.width/2,
    y: canvas.height/2
};

let __fn;
document.addEventListener('click', () => {
    gravity = 1000;
    birdHorizontalSpeed = 2;
}, {once: true});
document.addEventListener('click', __fn = () => {
    birdVelY = -jumpImpulse;
});

let birdY = center.y, birdVelY = 0;
function flappyBirdYPositionCalc() {
    birdVelY += (gravity*DeltaTime_s());
    birdY += birdVelY*DeltaTime_s();
}
function drawFlappyBird() {
    flappyBirdYPositionCalc();
    ctx.fillStyle = 'lime';
    ctx.fillRect(100, birdY, 30, 30);
}

let birdHorizontalSpeed = 0; // pixels per second
const jumpImpulse = 400;
let gravity = 0;
const horizontalGapBetweenBlocks = 200;
const verticalGapBetweenBlocksProportion = 0.3; // 20% of the canvas height
const startingBlockXPosition = 1.5 * canvas.width;
const lowestXPosition = -(0.5 * canvas.width);
const blockWidth = 50;

const maxBlockCount = () => 100;

function randomHeightProportion() {
    return (Math.random() * (0.9 - verticalGapBetweenBlocksProportion - 0.1) + 0.1); // Normalize the range into [0.1, 0.8]
}

/** @type {number[]} */
let blockArray = new Array(maxBlockCount()).fill().map(randomHeightProportion);
let totalXOffset = 0;

/**`n ∈ Z\Z-` @param n {number} */
function calculateBlockXPosition(n) {
    totalXOffset -= birdHorizontalSpeed * DeltaTime_s();
    return (startingBlockXPosition + n * (blockWidth + horizontalGapBetweenBlocks) + totalXOffset);
}

function createBlock(x, n) {
    const randProp = blockArray[n];
    let topBlockHeight = randProp * canvas.height;
    let bottomBlockHeight = (1 - verticalGapBetweenBlocksProportion - randProp) * canvas.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(x, 0, blockWidth, topBlockHeight);
    ctx.fillRect(x, canvas.height - bottomBlockHeight, blockWidth, bottomBlockHeight);
}

function collisionDetection() {
    for (let i = 0; i < blockArray.length; i++) {
        let x = calculateBlockXPosition(i);
        let randProp = blockArray[i];
        let topBlockHeight = randProp * canvas.height;
        let bottomBlockHeight = (1 - verticalGapBetweenBlocksProportion - randProp) * canvas.height;

        if (100 + 30 >= x && 100 <= x + blockWidth) {
            if (birdY <= topBlockHeight || birdY + 30 >= canvas.height - bottomBlockHeight) {
                return true;
            }
        }
    }

    if (birdY + 30 >= canvas.height || birdY <= 0) {
        return true;
    }

    return false;
}

/**
 * Finds the highest value of `n` for which;
 * `calculateBlockXPosition(n) < lowestXPosition`
 * @returns {number}
 */
function n_deep() {
    return Math.floor((lowestXPosition - startingBlockXPosition - totalXOffset) / (blockWidth + horizontalGapBetweenBlocks));
}

function createBlocks() {
    if(n_deep() >= maxBlockCount()) totalXOffset = 0;

    for (let i = 0; i < blockArray.length; i++) {
        createBlock(calculateBlockXPosition(i), i);
    }
}

function TimeElapsed_s() {
    return (Date.now() - startTime) / 1000;
}
function DeltaTime_s() {
    return __deltaTime_s;
}

const RetryModal = document.querySelector('dialog');
const scoreTexts = document.querySelectorAll('span#score');

let __currentScore = 0;
let __last_time = Date.now();
let __deltaTime_s = 0;
function Renderer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // New frame, clear the canvas

    drawFlappyBird()
    createBlocks();
    
    scoreTexts.forEach(e => e.textContent = __currentScore);
    if(collisionDetection()){
        RetryModal.showModal();
        return;
    }

    __currentScore = Math.max(0, n_deep() + 3);

    requestAnimationFrame(Renderer);
    __deltaTime_s = (Date.now() - __last_time) / 1000;
    __last_time = Date.now();
}

let startTime = Date.now();
Renderer(); // First call to start the loop