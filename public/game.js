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

const socket = io();

// Broadcast drawing data
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const data = {
            x: e.offsetX,
            y: e.offsetY,
            color: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
        };
        socket.emit('drawing', data);
    }
});

// Listen for drawing data from other players
socket.on('drawing', (data) => {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    [lastX, lastY] = [data.x, data.y];
});

// Retrieve player information from localStorage
const playerName = localStorage.getItem("playerName");
const selectedCharacter = localStorage.getItem("selectedCharacter");

// Validate room code before allowing access
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode');

if (!roomCode) {
    alert('Room code is required to access the game.');
    window.location.href = '/room.html';
} else {
    // Skip validation for auto-created rooms
    socket.emit("joinRoom", { roomCode, playerName, selectedCharacter });
}

// Listen for the updated player list from the server
socket.on("updatePlayerList", (players) => {
    const playerList = document.querySelector(".left-panel ul");
    if (!playerList) {
        // If the leaderboard container doesn't exist, create it
        const ul = document.createElement("ul");
        document.querySelector(".left-panel").appendChild(ul);
    }

    playerList.innerHTML = ""; // Clear the current list

    players.forEach((player) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${player.character}" class="avatar"> 
            ${player.name}`;
        playerList.appendChild(listItem);
    });
});

// List of words for the game
const words = [
    "Car", "House", "Tree", "Dog", "Cat", "Sun", "Moon", "Star", "Boat", "Fish",
    "Bird", "Flower", "Mountain", "River", "Chair", "Table", "Laptop", "Phone", "Book", "Clock"
];

// Function to randomly select a word
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// Display the randomly selected word
const drawWordElement = document.getElementById("draw-word");

if (roomCode) {
    // Multiplayer: Request the word from the server
    socket.emit("requestWord", roomCode);

    // Listen for the selected word from the server
    socket.on("wordSelected", (word) => {
        drawWordElement.textContent = word;
    });
} else {
    // Single-player: Select a random word locally
    const selectedWord = getRandomWord();
    drawWordElement.textContent = selectedWord;
}