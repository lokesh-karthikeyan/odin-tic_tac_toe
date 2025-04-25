// Singleton for Game Board object, returns current board state & method to update board.

const GameBoard = (function () {
  let board = new Array(9).fill("");

  const getBoard = () => board;

  const updateBoard = (index, marker) => {
    board[index] = marker;
    PubSub.publish("boardUpdated", { index, marker });
  };

  return { getBoard, updateBoard };
})();

// Player Factory for creating players with the player name & player marker.

const Player = (name, marker) => ({ name, marker });

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
