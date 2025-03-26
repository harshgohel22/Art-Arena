const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pencilBtn = document.querySelector(".pencilBtn");
const eraserBtn = document.querySelector(".eraserBtn");
const eraseAllBtn = document.querySelector(".eraseAllBtn");
const timerElement = document.getElementById("timer");

let isDrawing = false;
let isErasing = false;
let lastX = 0, lastY = 0;
let timeLeft = 90; // 90 seconds
let timerStarted = false;
let timerInterval;

// Set canvas size dynamically
function setCanvasSize() {
    canvas.width = canvas.parentElement.clientWidth * 0.9;
    canvas.height = canvas.parentElement.clientHeight * 0.9;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", setCanvasSize);
setCanvasSize();

// Start drawing function
function startDrawing(e) {
    if (!timerStarted) {
        startTimer(timeLeft, timerElement);
        timerStarted = true;
    }
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Draw function
function draw(e) {
    if (!isDrawing) return;

    ctx.strokeStyle = isErasing ? "white" : "black";
    ctx.lineWidth = isErasing ? 20 : 3;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Stop drawing function
function stopDrawing() {
    isDrawing = false;
}

// Attach event listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Change cursor function
function changeCursor(cursorURL) {
    console.log(`Changing cursor to: ${cursorURL}`); // Debugging log
    canvas.style.cursor = `url('${cursorURL}'), auto`;
}

// Activate pencil mode
pencilBtn.addEventListener("click", () => {
    if (timerStarted && timeLeft > 0) {
        isErasing = false;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        changeCursor("images/pencil.png");
    }
});

// Activate eraser mode
eraserBtn.addEventListener("click", () => {
    if (timerStarted && timeLeft > 0) {
        isErasing = true;
        changeCursor("images/eraser.png");
    }
});

// Erase all content
eraseAllBtn.addEventListener("click", () => {
    if (timerStarted && timeLeft > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

// Timer function
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `⏳ ${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            display.textContent = "⏳ 00:00";
            isDrawing = false;
            canvas.removeEventListener("mousedown", startDrawing);
            canvas.removeEventListener("mousemove", draw);
            canvas.removeEventListener("mouseup", stopDrawing);
            canvas.removeEventListener("mouseout", stopDrawing);
            pencilBtn.disabled = true;
            eraserBtn.disabled = true;
            eraseAllBtn.disabled = true;
        }
    }, 1000);
}