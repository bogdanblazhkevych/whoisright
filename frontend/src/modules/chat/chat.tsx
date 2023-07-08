import React, { useState, useEffect } from "react";
import Textinput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  receive_message: (dataObject: {message: string, sessionId: string, type: string}) => void;
}

interface ClientToServerEvents {
  send_message: (dataObject: {message: string, sessionId: string, type: string, userId: string}) => void;
  join_room: (sessionId: string) => void;
}

interface ChatMessageInterface {
    // sender: string;
    message: string,
    sessionId: string,
    type: string,
}

interface ChatPropsInterface {
    sessionId: string,
    userId: string
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://192.168.1.3:8000`);

export default function Chat(props: ChatPropsInterface){

    const { sessionId, userId } = props;

    const [messageLog, setMessageLog] = useState<ChatMessageInterface[]>([]);

    useEffect(() => {
        socket.emit('join_room', sessionId)

        socket.on('receive_message', (message) => {
            setMessageLog((previous) => [...previous, message])            
        })
    }, [socket])

    useEffect(() => {
        console.log(messageLog)
    }, [messageLog])

    function sendMessage(message: string) {
        const type = "outgoing"
        socket.emit("send_message", {message, sessionId, type, userId})
        setMessageLog((previous) => [...previous, {message, sessionId, type}]) 
    }

    return(
        <div className={chatcss.chatwrapper}>
            <Textoutput messageLog={messageLog}/>
            <Textinput sendMessage={sendMessage}/>
        </div>
    )
}