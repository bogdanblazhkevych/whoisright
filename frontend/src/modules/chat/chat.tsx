import React, { useState, useEffect } from "react";
import Textinput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  receive_message: (dataObject: {message: string, sessionId: string}) => void;
}

interface ClientToServerEvents {
  send_message: (dataObject: {message: string, sessionId: string}) => void;
  join_room: (sessionId: string) => void;
}

interface ChatMessageInterface {
    // sender: string;
    message: string,
    sessionId: string
}

interface ChatPropsInterface {
    sessionId: string
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://192.168.1.9:8000');

export default function Chat(props: ChatPropsInterface){

    const { sessionId } = props;

    const [messageLog, setMessageLog] = useState<ChatMessageInterface[]>([]);

    useEffect(() => {
        socket.emit('join_room', sessionId)
        console.log(sessionId)

        socket.on('receive_message', (message) => {
            setMessageLog((previous) => [...previous, message])  
            console.log(message)          
        })
    }, [socket])

    function sendMessage(message: string) {
        socket.emit("send_message", {message, sessionId})
    }

    return(
        <div className={chatcss.chatwrapper}>
            <Textoutput messageLog={messageLog}/>
            <Textinput sendMessage={sendMessage}/>
        </div>
    )
}