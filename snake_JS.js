document.getElementById("playButton").addEventListener("click", () => {
  document.getElementById("preGameMenu").style.display = "none";
  init();
});

document.getElementById("scoresButton").addEventListener("click", () => {
  showScores();
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 30;
const snakeColor = "#0F0";
const foodColor = "#F00";
let snake, food, score, gameInterval;
let dx = gridSize;
let dy = 0;

let touchStartX = null;
let touchStartY = null;

let scores = JSON.parse(localStorage.getItem("scores")) || [];
const maxScores = 10;

function init() {
  snake = [{ x: gridSize * 5, y: gridSize * 5 }];
  food = createFood();
  score = 0;
  document.getElementById("score").textContent = `${score}`;
  startGame();

  // Aggiunta del supporto per touchscreen
  canvas.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0 && dx === 0) {
        dx = gridSize;
        dy = 0;
      } else if (diffX < 0 && dx === 0) {
        dx = -gridSize;
        dy = 0;
      }
    } else {
      if (diffY > 0 && dy === 0) {
        dx = 0;
        dy = gridSize;
      } else if (diffY < 0 && dy === 0) {
        dx = 0;
        dy = -gridSize;
      }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
  });
}

function createFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * (canvas.width / gridSize - 2) + 1) * gridSize;
    y = Math.floor(Math.random() * (canvas.height / gridSize - 2) + 1) * gridSize;
  } while (snake.some((segment) => segment.x === x && segment.y === y));
  return { x, y };
}

function startGame() {
  const speed = 200 - (snake.length - 1) * 10;
  clearInterval(gameInterval);
  gameInterval = setInterval(drawGame, Math.max(speed, 50));
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateSnakePosition();
  handleCollision();
  drawSnake();
  drawFood();
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const colorValue = Math.floor((255 * i) / snake.length);
    ctx.fillStyle = `rgb(${colorValue}, 255, ${colorValue})`;

    drawRoundedRect(ctx, segment.x, segment.y, gridSize, gridSize, gridSize / 5);
  }
}

function drawRoundedRect(ctx, x, y, width, height, borderRadius) {
  ctx.beginPath();
  ctx.arc(x + borderRadius, y + borderRadius, borderRadius, Math.PI, (3 * Math.PI) / 2);
  ctx.arc(x + width - borderRadius, y + borderRadius, borderRadius, (3 * Math.PI) / 2, 2 * Math.PI);
  ctx.arc(x + width - borderRadius, y + height - borderRadius, borderRadius, 0, Math.PI / 2);
  ctx.arc(x + borderRadius, y + height - borderRadius, borderRadius, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawFood() {
  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
  ctx.fill();
}

function updateSnakePosition() {
  const newHead = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  snake.unshift(newHead);
  snake.pop();
}

function handleCollision() {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    score++;
    document.getElementById("score").textContent = `${score}`;
    snake.push({});
    food = createFood();
    startGame();
  }

  if (snake[0].x < 0) snake[0].x = canvas.width - gridSize;
  if (snake[0].x >= canvas.width) snake[0].x = 0;
  if (snake[0].y < 0) snake[0].y = canvas.height - gridSize;
  if (snake[0].y >= canvas.height) snake[0].y = 0;

  if (
    snake
      .slice(1)
      .some((segment) => segment.x === snake[0].x && segment.y === snake[0].y)
  ) {
    clearInterval(gameInterval);
    alert(`Hai perso! Punteggio finale: ${score}`);
    updateScores(score);
    init();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -gridSize;
  }
  if (event.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = gridSize;
  }
  if (event.key === "ArrowLeft" && dx === 0) {
    dx = -gridSize;
    dy = 0;
  }
  if (event.key === "ArrowRight" && dx === 0) {
    dx = gridSize;
    dy = 0;
  }
});

function updateScores(newScore) {
  scores.push(newScore);
  scores.sort((a, b) => b - a);
  if (scores.length > maxScores) {
    scores.pop();
  }
  localStorage.setItem("scores", JSON.stringify(scores));
}

function showScores() {
  const topScores = scores.slice(0, 3).join("\n");
  const lastTenGames = scores.slice(-10).join("\n");
  alert(
    `Migliori tre punteggi:\n${topScores}\n\nUltime 10 partite:\n${lastTenGames}`
  );
}

init();
