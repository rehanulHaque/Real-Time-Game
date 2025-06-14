import { useState, type FormEvent } from "react";
import { useAppContext } from "../Context/AppContext";

export default function Room() {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomName, setJoinRoomName] = useState("");
  const { joinRoom } = useAppContext();

  const handelJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    joinRoom(joinRoomId, joinRoomName);
  };
  return (
    <section className="flex justify-center flex-col md:flex-row gap-4 items-center h-screen">
      
      <form onSubmit={handelJoin} className="flex gap-4 flex-col">
        <h1 className="text-2xl font-bold">Join Room</h1>
        <input
          type="text"
          placeholder="Enter Room Id"
          onChange={(e) => setJoinRoomId(e.target.value)}
          value={joinRoomId}
        />
        <input
          type="text"
          placeholder="Enter Name"
          onChange={(e) => setJoinRoomName(e.target.value)}
          value={joinRoomName}
        />
        <button>Join</button>
      </form>
    </section>
  );
}
