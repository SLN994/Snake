const style = document.createElement('style');
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  
  .score-item {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 5px;
    margin: 5px 0;
    font-family: 'Press Start 2P', cursive;
  }

  #scoresPopup {
    box-sizing: border-box;
  }

  #scoresPopup ol {
    padding-left: 20px;
  }
`;

document.head.appendChild(style);

document.getElementById("playButton").addEventListener("click", () => {
  const username = document.getElementById("usernameInput").value;
  if (username.trim() === "") {
    alert("Inserisci un nome utente");
  } else {
    document.getElementById("preGameMenu").style.display = "none";
    init();
  }
});

document.getElementById("scoresButton").addEventListener("click", () => {
  fetchScores();
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 30;
const snakeColor = "#0F0";
const foodColor = "#F00";
let snake, food, score, gameInterval;
let dx = gridSize;
let dy = 0;
let directionChanged = false; // Aggiungi questa variabile
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
  directionChanged = false; // Impostala su false qui
 
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

	   if (directionChanged) {
    return;
  }

	  
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0 && dx === 0) {
        dx = gridSize;
        dy = 0;
		directionChanged = true;
      } else if (diffX < 0 && dx === 0) {
        dx = -gridSize;
        dy = 0;
		directionChanged = true;
      }
    } else {
      if (diffY > 0 && dy === 0) {
        dx = 0;
        dy = gridSize;
		directionChanged = true;
      } else if (diffY < 0 && dy === 0) {
        dx = 0;
        dy = -gridSize;
		directionChanged = true;
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
  const speed = 200 - (snake.length - 1) * 10 * 0.5;
  clearInterval(gameInterval);
  gameInterval = setInterval(drawGame, Math.max(speed, 50));
}

function drawGame() {
  directionChanged = false; // Reimposta directionChanged all'inizio di ogni aggiornamento del gioco
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
    displayScoresPopup(score);
  }
}

function displayScoresPopup(score) {
  const existingPopup = document.getElementById("scoresPopup");
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }

  const popup = document.createElement("div");
  popup.id = "scoresPopup";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  popup.style.padding = "20px";
  popup.style.borderRadius = "20px";
  popup.style.width = "80%";
  popup.style.maxWidth = "500px";
  popup.style.textAlign = "center";

  const title = document.createElement("h2");
  title.textContent = `Hai perso! Punteggio finale: ${score}`;
  title.style.color = "white";
  title.style.marginBottom = "20px";
  title.style.fontFamily = "'Press Start 2P', cursive";
  popup.appendChild(title);

  // Aggiungi un pulsante "Rigioca" al popup
  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.style.display = "block";
  playAgainButton.style.margin = "20px auto";
  playAgainButton.style.padding = "10px 20px";
  playAgainButton.style.backgroundColor = "#4CAF50";
  playAgainButton.style.color = "white";
  playAgainButton.style.border = "none";
  playAgainButton.style.cursor = "pointer";
  playAgainButton.style.borderRadius = "5px";
  playAgainButton.style.outline = "none";
  playAgainButton.style.fontFamily = "'Press Start 2P', cursive";
  playAgainButton.addEventListener("click", () => {
    document.body.removeChild(popup);
    init(); // Riavvia il gioco
  });
  popup.appendChild(playAgainButton);
	
  const closeButton = document.createElement("button");
  closeButton.textContent = "Mostra Classifica";
  closeButton.style.display = "block";
  closeButton.style.margin = "20px auto";
  closeButton.style.padding = "10px 20px";
  closeButton.style.backgroundColor = "#4CAF50";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.cursor = "pointer";
  closeButton.style.borderRadius = "5px";
  closeButton.style.outline = "none";
  closeButton.style.fontFamily = "'Press Start 2P', cursive";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(popup);
    updateScores(score);
    fetchScores();
  });
  popup.appendChild(closeButton);

  document.body.appendChild(popup);
}



document.addEventListener("keydown", (event) => {
  // Modifica il gestore degli eventi "keydown" per verificare che il serpente non possa cambiare direzione a 180 gradi
  if (event.key === "ArrowUp" && dy === 0 && !directionChanged) {
    dx = 0;
    dy = -gridSize;
    directionChanged = true;
  }
  if (event.key === "ArrowDown" && dy === 0 && !directionChanged) {
    dx = 0;
    dy = gridSize;
    directionChanged = true;
  }
  if (event.key === "ArrowLeft" && dx === 0 && !directionChanged) {
    dx = -gridSize;
    dy = 0;
    directionChanged = true;
  }
  if (event.key === "ArrowRight" && dx === 0 && !directionChanged) {
    dx = gridSize;
    dy = 0;
    directionChanged = true;
  }
});


function updateScores(newScore) {
  const username = document.getElementById("usernameInput").value || "Anonimo";

  // Invia il punteggio al server
  fetch("save_score.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, score: newScore })
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Punteggio salvato:", data);
    })
    .catch((error) => {
      console.error("Errore durante il salvataggio del punteggio:", error);
    });
}

function fetchScores() {
  fetch("fetch_scores.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayScores(data.scores);
      } else {
        console.error("Errore durante il recupero dei punteggi:", data.message);
      }
    })
    .catch((error) => {
      console.error("Errore durante il recupero dei punteggi:", error);
    });
}

// La tua funzione displayScores() ora dovrebbe apparire come segue:
function displayScores(scores) {
  // Rimuovi il popup esistente, se presente
  const existingPopup = document.getElementById("scoresPopup");
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }

  // Crea un nuovo popup per la classifica
  const popup = document.createElement("div");
  popup.id = "scoresPopup";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  popup.style.padding = "20px";
  popup.style.borderRadius = "20px"; // Aumenta il borderRadius per angoli più arrotondati
  popup.style.width = "100%";
  popup.style.maxWidth = "500px";
  popup.style.textAlign = "center";

  // Aggiungi titolo al popup
  const title = document.createElement("h2");
  title.textContent = "Classifica";
  title.style.color = "white";
  title.style.marginBottom = "20px";
  title.style.fontFamily = "'Press Start 2P', cursive"; // Usa un font più adatto a un gioco
  popup.appendChild(title);

	

	
  // Funzione per creare un elemento lista con stile personalizzato
  function createStyledListItem(score) {
    const listItem = document.createElement("li");
    listItem.className = "score-item";
    listItem.textContent = `${score.username}: ${score.score}`;
    listItem.style.color = "white";
    return listItem;
  }

  // Crea elenco dei tre migliori punteggi di sempre
  const topScoresList = document.createElement("ol");
  topScoresList.innerHTML = "<strong>I tre migliori punteggi:</strong>";
  const topScores = scores.slice(0, 3);
  topScores.forEach((score) => {
    topScoresList.appendChild(createStyledListItem(score));
  });
  popup.appendChild(topScoresList);

  // Crea elenco delle ultime 10 partite
  const lastTenGamesList = document.createElement("ol");
  lastTenGamesList.style.marginTop = "20px";
  lastTenGamesList.innerHTML = "<strong>Ultime 10 partite:</strong>";
  const lastTenGames = scores.slice(-10);
  lastTenGames.forEach((score) => {
    lastTenGamesList.appendChild(createStyledListItem(score));
  });
  popup.appendChild(lastTenGamesList);

	
	// Aggiungi un pulsante "Rigioca" al popup
  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.style.display = "block";
  playAgainButton.style.margin = "20px auto";
  playAgainButton.style.padding = "10px 20px";
  playAgainButton.style.backgroundColor = "#4CAF50";
  playAgainButton.style.color = "white";
  playAgainButton.style.border = "none";
  playAgainButton.style.cursor = "pointer";
  playAgainButton.style.borderRadius = "5px";
  playAgainButton.style.outline = "none";
  playAgainButton.style.fontFamily = "'Press Start 2P', cursive";
  playAgainButton.addEventListener("click", () => {
    document.body.removeChild(popup);
    init(); // Riavvia il gioco
  });
  popup.appendChild(playAgainButton);


// Aggiunta del popup alla pagina
document.body.appendChild(popup);
}
