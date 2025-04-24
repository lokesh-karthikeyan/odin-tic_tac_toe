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
