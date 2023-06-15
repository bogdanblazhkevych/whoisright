import React, { useState, useEffect } from "react";
import Textinput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  receive_message: (a: ChatMessageInterface) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  send_message: (message: string) => void;
}

interface ChatMessageInterface {
    // sender: string;
    message: string
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:8000');

export default function Chat(){

    const [messageLog, setMessageLog] = useState<ChatMessageInterface[]>([]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            setMessageLog((previous) => [...previous, message])
            console.log(messageLog)
            console.log(message)
        })
    }, [socket])

    function sendMessage(message: string) {
        socket.emit("send_message", message)
    }

    return(
        <div className={chatcss.chatwrapper}>
            <Textoutput />
            <Textinput sendMessage={sendMessage}/>
        </div>
    )
}