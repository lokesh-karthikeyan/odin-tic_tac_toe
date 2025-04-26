// Singleton for Game Board object, returns current board state & method to update board.

const GameBoard = (function () {
  let board = new Array(9).fill("");

  const getBoard = () => board;

  const updateBoard = (index, marker) => {
    board[index] = marker;
    PubSub.publish("boardUpdated", { index, marker, board });
  };

  return { getBoard, updateBoard };
})();

// Player Factory for creating players with the player name & player marker.

const player = (name, marker) => {
  let score = 0;
  const getScore = () => score;
  const giveScore = () => score++;
  const changeName = (newName) => (name = newName);

  return {
    get name() {
      return name;
    },
    marker,
    getScore,
    giveScore,
    changeName,
  };
};

// Publish/Subscribe pattern during board updates.

const PubSub = (function () {
  let events = {};

  const publish = (event, data) => {
    if (events[event]) {
      events[event].forEach((callback) => callback(data));
    }
  };

  const subscribe = (event, callback) => {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
  };

  return { publish, subscribe };
})();

// Placement logic of the current marker, and index.

const Placement = (function () {
  let previousMarker = "";

  const isValidIndex = (board, index) => board[index] === "";
  const isValidMarker = (currentMarker) => currentMarker !== previousMarker;
  const isValid = (index, marker, board) =>
    isValidIndex(board, index) && isValidMarker(marker);

  PubSub.subscribe("boardUpdated", ({ marker }) => (previousMarker = marker));

  return { isValid };
})();

// Game has a Winner logic, when the 'X' (or) 'O' is aligned.

const hasWinner = (board) => {
  const winningPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const position of winningPositions) {
    const [positionX, positionY, positionZ] = position;
    const [valueX, valueY, valueZ] = [
      board[positionX],
      board[positionY],
      board[positionZ],
    ];

    if (valueX !== "" && valueX === valueY && valueX === valueZ) return valueX;
  }

  return false;
};

// Game tied logic, when all spots are filled & no winner.

const isTied = (board) =>
  board.filter((value) => value).length === board.length;

// Game Over logic, checks if the game has a winner (or) it's a tie.

const GameStatus = (function () {
  let gameState = null;

  const updateGameState = (board, marker) => {
    let roundWon = hasWinner(board);
    let roundTied = !roundWon && isTied(board);

    if (roundWon) {
      PubSub.publish("gameOver", marker);
      return (gameState = marker);
    }
    if (roundTied) return (gameState = "");

    return (gameState = null);
  };

  const getGameState = () => gameState;

  PubSub.subscribe("boardUpdated", ({ board, marker }) =>
    updateGameState(board, marker),
  );

  return { getGameState };
})();

// Player Manager which wraps all player related methods.

const playerManager = (function () {
  const players = [];
  let currentPlayer = null;
  let winnerPlayer = null;

  const createPlayer = (name, marker) => {
    if (players.length > 2) return;

    let newPlayer = player(name, marker);
    players.push(newPlayer);
    if (!currentPlayer) currentPlayer = newPlayer;
    return newPlayer;
  };

  const getCurrentPlayer = () => currentPlayer;

  const switchPlayers = () =>
    (currentPlayer = currentPlayer === players[0] ? players[1] : players[0]);

  const getWinnerPlayer = () => winnerPlayer;

  PubSub.subscribe("gameOver", (marker) => {
    winnerPlayer = marker
      ? players.find((player) => player.marker === marker)
      : "";
  });

  const getFirstPlayer = () => players[0];

  const getSecondPlayer = () => players[1];

  return {
    createPlayer,
    getCurrentPlayer,
    switchPlayers,
    getWinnerPlayer,
    getFirstPlayer,
    getSecondPlayer,
  };
})();

// Create and set Player Names & Score.

const updatePlayerDetails = (function () {
  let [firstPlayerContainer, secondPlayerContainer] = document.querySelectorAll(
    ".main-content__player",
  );
  let playerInstance = playerManager;
  let playerOne = playerInstance.createPlayer("Player - 1", "X");
  let playerTwo = playerInstance.createPlayer("Player - 2", "O");

  let playerOneNameContainer = firstPlayerContainer.querySelector(
    ".main-content__player-name",
  );
  let playerTwoNameContainer = secondPlayerContainer.querySelector(
    ".main-content__player-name",
  );
  let playerOneScoreContainer = firstPlayerContainer.querySelector(
    ".main-content__player-score",
  );
  let playerTwoScoreContainer = secondPlayerContainer.querySelector(
    ".main-content__player-score",
  );

  playerOneNameContainer.textContent = playerOne.name;
  playerTwoNameContainer.textContent = playerTwo.name;
  playerOneScoreContainer.textContent = playerOne.getScore();
  playerTwoScoreContainer.textContent = playerTwo.getScore();
})();

// Edit player name Event

const editPlayerName = (function () {
  const playerDetailsContainer = document.querySelector(
    ".main-content__score-container",
  );

  playerDetailsContainer.addEventListener("click", (event) => {
    if (event.target.tagName !== "A") return;

    const playerNameContainer = event.target.closest(
      ".main-content__player-name-container",
    );
    let playerName = playerNameContainer.querySelector(
      ".main-content__player-name",
    );
    let playerInput = playerNameContainer.querySelector("input");

    toggleClass(playerName, "is-inactive");
    toggleClass(playerInput, "is-inactive");
    toggleClass(playerInput, "is-active");

    playerInput.value = playerName.textContent.trim();
    playerInput.focus();
  });
})();

// Out of focus on Input element.

const outOfFocusEvent = (function () {
  const inputElements = document.querySelectorAll("input");
  let isProcessing = false;

  inputElements.forEach((inputElement) => {
    inputElement.addEventListener("blur", (event) => {
      if (isProcessing) return;
      exitInputEvent(event.target);
    });

    inputElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        isProcessing = true;
        exitInputEvent(event.target);
        setTimeout(() => (isProcessing = false), 100);
      }
    });
  });

  const exitInputEvent = (currentInputElement) => {
    let playerNameElement = currentInputElement
      .closest(".main-content__player-name-container")
      .querySelector(".main-content__player-name");

    changePlayerName(playerNameElement, currentInputElement);

    toggleClass(playerNameElement, "is-inactive");
    toggleClass(currentInputElement, "is-inactive");
    toggleClass(currentInputElement, "is-active");
  };
})();

// Toggle Classes

const toggleClass = (element, htmlClassName) =>
  element.classList.toggle(htmlClassName);

// Change Player Names.

const changePlayerName = (playerNameElement, currentInputElement) => {
  let newName = currentInputElement.value;
  let playerId = playerNameElement.dataset.player;
  let playerInstance = playerManager;
  let player;

  player = playerId.includes("1")
    ? playerInstance.getFirstPlayer()
    : playerInstance.getSecondPlayer();
  player.changeName(newName);
  playerNameElement.textContent = newName;
};

// Event for Game Play.

const selectTile = (function () {
  let gameTiles = document.querySelector(".main-content__buttons");

  gameTiles.addEventListener("click", (event) => {
    let position = event.target.dataset.index;

    playGame(position);
    updateBoard();
  });
})();

// Game Play logic.

const playGame = (position) => {
  const gameInstance = GameBoard;
  const board = gameInstance.getBoard();
  const gameStatus = GameStatus;
  let currentPlayer = playerManager.getCurrentPlayer();

  let isValidPlacement = Placement.isValid(
    position,
    currentPlayer.marker,
    board,
  );

  if (!isValidPlacement) return;

  gameInstance.updateBoard(position, currentPlayer.marker);
  playerManager.switchPlayers();

  let currentState = gameStatus.getGameState();

  if (currentState === null) return;

  let dialogBox = document.querySelector(".modal");
  let modalBody = dialogBox.querySelector(".modal__content");

  if (currentState === "") {
    modalBody.textContent = "It's a Tie!!!";
  } else {
    let winner = playerManager.getWinnerPlayer();
    modalBody.textContent = `${winner.marker} -> ( ${winner.name} wins!!! )`;
  }
  dialogBox.showModal();
};

// Update Game Board

const updateBoard = () => {
  const gameInstance = GameBoard;
  const board = gameInstance.getBoard();

  board.forEach((item, index) => {
    let dataAttribute = `[data-index="${index}"]`;
    let tile = document.querySelector(dataAttribute);
    tile.textContent = item;
    if (tile.textContent !== "") tile.classList.add("unavailable");
  });
};

// Close Modal / Reset Game
