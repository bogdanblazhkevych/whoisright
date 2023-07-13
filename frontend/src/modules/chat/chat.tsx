import React, { useState, useEffect, useRef } from "react";
import TextInput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  receive_message: (dataObject: {message: string, sessionId: string, type: string, userId: string}) => void;
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
    userId: string,
}

interface ChatDataUserObjectInterface {
    [key: string]: string,
    displayName: string,
    userId: string
}

interface ChatPropsInterface {
    chatData: {
        sessionId: string,
        role: string,
        host: {
          displayName: string,
          userId: string
        }
        guest: {
          displayName: string,
          userId: string
        }
    }
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://172.20.10.2:8000`);

export default function Chat(props: ChatPropsInterface){
    const { chatData } = props;
    const sessionId = chatData.sessionId;
    const userId = chatData.role === 'host' ? chatData.host.userId : chatData.guest.userId
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
        setMessageLog((previous) => [...previous, {message, sessionId, type, userId}]) 
    }

    return(
        <div className={chatcss.chatwrapper}>
            <Textoutput messageLog={messageLog}/>
            <TextInput sendMessage={sendMessage}/>
        </div>
    )
}