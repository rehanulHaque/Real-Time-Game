import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface AppContextProps {
  socket: Socket | null;
  joinRoom: (roomId: string, name: string) => void;
  users: { userId: string; name: string }[];
  socketId?: string;
  message?: string;
  turnsTo?: string;
  gameState: string[];
  winner: string | null;
  winningCells: number[];
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string>();
  const [users, setUsers] = useState<{ userId: string; name: string }[]>([]);
  const [message, setMessage] = useState<string>();
  const [turnsTo, setTurnsTo] = useState<string>();
  const [gameState, setGameState] = useState<string[]>(Array(9).fill(""));
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.MODE === "development"?  "http://localhost:3000/api" : "/"
  useEffect(() => {
    const socket = io(BASE_URL);
    setSocket(socket);

    socket.on("connect", () => setSocketId(socket.id));

    socket.on("start_game", (data) => {
  setUsers(data.users);
  setMessage(data.message);
  setTurnsTo(data.turnsTo);
  setGameState(data.gameState);
  setWinner(null);
  setWinningCells([]);
});


    socket.on("update_game", (data) => {
      setGameState(data.gameState);
      setTurnsTo(data.turnsTo);
      if (data.winner) setWinner(data.winner);
      if (data.winningCells) setWinningCells(data.winningCells);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  const joinRoom = (roomId: string, name: string) => {
    socket?.emit("join_room", { roomId, name });
    navigate(`/game/${roomId}`);
  };

  return (
    <AppContext.Provider
      value={{
        socket,
        joinRoom,
        users,
        socketId,
        message,
        turnsTo,
        gameState,
        winner,
        winningCells,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
