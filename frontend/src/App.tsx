import React from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

const socket: Socket<ClientToServerEvents, ServerToClientEvents> = io();

function App() {
  return (
    <div className="App">
      <Chat />
    </div>
  );
}

export default App;
