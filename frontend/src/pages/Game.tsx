import { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";

export default function GameBoard() {
  const {
    socket,
    socketId,
    users,
    message,
    turnsTo,
    gameState,
    winner,
    winningCells,
  } = useAppContext();

  const [localMark, setLocalMark] = useState<"X" | "O">("X");
  const [turn, setTurn] = useState(false);

  useEffect(() => {
    if (users.length === 2) {
      setLocalMark(users[0].userId === socketId ? "X" : "O");
    }
  }, [users, socketId]);

  useEffect(() => {
    setTurn(socketId === turnsTo);
  }, [turnsTo, socketId]);

  const handleClick = (index: number) => {
    if (!turn || gameState[index] !== "" || winner) return;
    socket?.emit("make_move", { index, player: socketId });
  };

  if (users.length < 2) {
    return (
      <div className="h-screen flex justify-center items-center text-2xl">
        Waiting for another player...
      </div>
    );
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div>
        <h1 className="text-center text-2xl mb-4">{message}</h1>

        {!winner && (
          <p className="text-center mb-4">
            {turn ? "Your Turn" : "Opponent's Turn"} ({localMark})
          </p>
        )}

        {winner && (
          <p className="text-center mb-4 text-green-600 font-bold text-xl">
            {socketId === winner ? "You Win!" : "Opponent Wins!"}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {gameState.map((val, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`h-24 w-24 flex items-center justify-center text-3xl font-bold border 
                ${winningCells.includes(idx) ? "bg-green-300" : "bg-white"} 
                cursor-pointer`}
            >
              {val}
            </div>
          ))}
        </div>

        {winner && (
  <button
    onClick={() =>
      socket?.emit("restart_game", { roomId: window.location.pathname.split("/").pop() })
    }
    className="mt-6 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  >
    Restart Game
  </button>
)}

      </div>
    </div>
  );
}
