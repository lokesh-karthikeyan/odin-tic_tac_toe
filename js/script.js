// Singleton for Game Board object, returns current board state & method to update board.

const GameBoard = (function () {
  let board = new Array(9).fill("");

  const getBoard = () => board;

  const updateBoard = (index, marker) => {
    board[index] = marker;
  };

  return { getBoard, updateBoard };
})();

// Player Factory for creating players with the player name & player marker.

const Player = (name, marker) => ({ name, marker });

// Placement logic of the current marker, and index.

const Placement = (function () {
  let previousMarker = "";

  const isValidIndex = (board, index) => board[index] === "";
  const isValidMarker = (currentMarker) => currentMarker !== previousMarker;
  const isValid = (index, marker, board) =>
    isValidIndex(board, index) && isValidMarker(marker);

  return { isValid };
})();

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
