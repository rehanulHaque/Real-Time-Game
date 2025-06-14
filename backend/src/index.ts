import {config} from "dotenv"
config()
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

type User = { userId: string; name: string };
type Room = {
  users: User[];
  turnsTo: string;
  gameState: string[];
};

const rooms: Map<string, Room> = new Map();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join_room", ({ roomId, name }) => {
  socket.join(roomId);

  // Check if room already exists
  let room = rooms.get(roomId);

  // If it exists but already has 2 users, don't allow more
  if (room && room.users.length === 2) {
    socket.emit("room_full");
    return;
  }

  // If room doesn't exist, create it
  if (!room) {
    room = {
      users: [],
      gameState: Array(9).fill(""),
      turnsTo: "",
    };
    rooms.set(roomId, room);
  }

  // Remove previous user with same socket ID if exists (refresh case)
  room.users = room.users.filter(u => u.userId !== socket.id);

  // Add current user
  room.users.push({ userId: socket.id, name });

  // When both users joined, reset everything
  if (room.users.length === 2) {
    room.gameState = Array(9).fill("");
    room.turnsTo = room.users[0].userId; // "X" always starts

    io.to(roomId).emit("start_game", {
      roomId,
      users: room.users,
      message: "Game Started!",
      turnsTo: room.turnsTo,
      gameState: room.gameState,
    });
  }
});


  socket.on("make_move", ({ index, player }) => {
  for (const [roomId, room] of rooms.entries()) {
    const isInRoom = room.users.find(u => u.userId === player);
    if (!isInRoom) continue;

    if (room.gameState[index] !== "") return;

    const mark = player === room.users[0].userId ? "X" : "O";
    room.gameState[index] = mark;

    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const hasWinner = winningCombinations.find(([a, b, c]) =>
      room.gameState[a] &&
      room.gameState[a] === room.gameState[b] &&
      room.gameState[a] === room.gameState[c]
    );

    if (hasWinner) {
      io.to(roomId).emit("update_game", {
        gameState: room.gameState,
        turnsTo: null,
        winner: player,
        winningCells: hasWinner,
      });
      return; // ⛔ Don't reset anything, let frontend trigger restart
    }

    // Draw check (optional)
    const isDraw = room.gameState.every(cell => cell !== "");
    if (isDraw) {
      io.to(roomId).emit("update_game", {
        gameState: room.gameState,
        turnsTo: null,
        winner: "Draw",
      });
      return;
    }

    // Switch turn
    const otherUser = room.users.find(u => u.userId !== player);
    if (!otherUser) return;
    room.turnsTo = otherUser.userId;

    io.to(roomId).emit("update_game", {
      gameState: room.gameState,
      turnsTo: room.turnsTo,
    });

    break;
  }
});

socket.on("restart_game", ({ roomId }) => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.gameState = Array(9).fill("");
  room.turnsTo = room.users[0].userId;

  io.to(roomId).emit("start_game", {
    roomId,
    users: room.users,
    message: "New game started!",
    turnsTo: room.turnsTo,
    gameState: room.gameState,
  });
});



  socket.on("disconnect", () => {
  for (const [roomId, room] of rooms.entries()) {
    const index = room.users.findIndex(u => u.userId === socket.id);
    if (index !== -1) {
      room.users.splice(index, 1);

      // If no users left, delete room
      if (room.users.length === 0) {
        rooms.delete(roomId);
      }
    }
  }
});

});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
