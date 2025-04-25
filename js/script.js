// Singleton for Game Board object, returns current board state & method to update board.

const GameBoard = (function () {
  let board = new Array(9).fill("");

  const getBoard = () => {
    return board;
  };

  const updateBoard = (index, marker) => {
    board[index] = marker;
  };

  return { getBoard, updateBoard };
})();

// Player Factory for creating players with the player name & player marker.

const Player = (name, marker) => {
  return { name, marker };
};

// Placement logic of the current marker, and index.

const Placement = (function () {
  let previousMarker = "";

  const isValidIndex = (board, index) => {
    return board[index] === "";
  };

  const isValidMarker = (currentMarker) => {
    return currentMarker !== previousMarker;
  };

  const isValid = (index, marker, board) => {
    return isValidIndex(board, index) && isValidMarker(marker);
  };

  return { isValid };
})();
