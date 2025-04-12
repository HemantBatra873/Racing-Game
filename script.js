const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const crashSound = document.getElementById("crashSound");
const bgMusic = document.getElementById("bgMusic");

// Score tracking
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
document.getElementById("bestScore").textContent = `Best: ${bestScore}`;

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const playerImg = new Image();
playerImg.src = "assets/player-car.svg";

const enemyImg = new Image();
enemyImg.src = "assets/enemy_car.svg";

const roadImg = new Image();
roadImg.src = "assets/road.png";

// Game variables
let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 150,
  width: 50,
  height: 100,
  speed: 7,
};

let enemies = [];
let enemySpeed = 5;
let spawnInterval = 1500;
let lastSpawn = Date.now();
let gamePaused = false;
let animationId;

// Pause overlay elements
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeBtn = document.getElementById("resumeBtn");

// Event listeners
document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
    togglePause();
  }
});

resumeBtn.addEventListener("click", () => {
  togglePause();
});

setInterval(() => {
  if (!gamePaused) {
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);
      document.getElementById("bestScore").textContent = `Best: ${bestScore}`;
    }
  }
}, 1000);

function togglePause() {
  gamePaused = !gamePaused;
  if (gamePaused) {
    cancelAnimationFrame(animationId);
    pauseOverlay.style.display = "flex"; // Show overlay
    bgMusic.pause();
  } else {
    pauseOverlay.style.display = "none"; // Hide overlay
    bgMusic.play();
    animate();
  }
}

// Handle player movement
let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function movePlayer() {
  if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && player.x > 0) {
    player.x -= player.speed;
  }
  if (
    (keys["ArrowRight"] || keys["d"] || keys["D"]) &&
    player.x + player.width < canvas.width
  ) {
    player.x += player.speed;
  }
}

// Spawn enemies
function spawnEnemy() {
  const x = Math.random() * (canvas.width - 50);
  enemies.push({ x: x, y: -100, width: 50, height: 100 });
}

// Draw functions
function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawPlayer() {
  drawRotatedImage(
    playerImg,
    player.x,
    player.y,
    player.width * 2,
    player.height,
    -Math.PI / 2
  ); // 90 degrees
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    drawRotatedImage(
      enemyImg,
      enemy.x,
      enemy.y,
      enemy.width * 2,
      enemy.height,
      Math.PI / 2
    ); // -90 degrees
  });
}

function resetGame() {
  enemies = [];
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 120; // slightly higher than before
  score = 0;
  document.getElementById("score").textContent = `Score: ${score}`;
  bgMusic.currentTime = 0;
  bgMusic.play();
  animate();
}

function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemySpeed;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    }

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      cancelAnimationFrame(animationId);
      crashSound.play();
      bgMusic.pause();
      alert("Game Over!");
      resetGame();
    }
  });
}

window.onload = () => {
  pauseOverlay.style.display = "none";
  bgMusic.volume = 0.3;
  crashSound.volume = 0.5;
  bgMusic.play();
  animate();
};

// Main animation loop
function animate() {
  if (gamePaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  drawPlayer();
  drawEnemies();
  updateEnemies();

  // Spawn enemies at intervals
  if (Date.now() - lastSpawn > spawnInterval) {
    spawnEnemy();
    lastSpawn = Date.now();
  }

  animationId = requestAnimationFrame(animate);
}
