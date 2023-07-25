import React, { useState, useEffect, useRef } from "react";
import TextInput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";
import ChatDetails from "../chatdetails/chatdetails";

interface ServerToClientEvents {
  receive_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void;
}

interface ClientToServerEvents {
  send_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void;
  join_room: (sessionId: string) => void;
}

interface ChatMessageInterface {
    // sender: string;
    message: string,
    sessionId: string,
    type: string,
    userId: string,
    displayName: string
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

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://10.13.1.176:8000`);

export default function Chat(props: ChatPropsInterface){
    const { chatData } = props;
    const sessionId = chatData.sessionId;
    const userId = chatData.role === 'host' ? chatData.host.userId : chatData.guest.userId;
    const displayName = chatData.role === 'host' ? chatData.host.displayName : chatData.guest.displayName;
    const type = "outgoing"
    const [messageLog, setMessageLog] = useState<ChatMessageInterface[]>([]);

    useEffect(() => {
        socket.emit('join_room', sessionId)

        socket.on('receive_message', (message) => {
            setMessageLog((previous) => [...previous, message])            
        })
    }, [socket])

    function sendMessage(message: string) {
        socket.emit("send_message", {message, sessionId, type, userId, displayName})
        setMessageLog((previous) => [...previous, {message, sessionId, type, userId, displayName}]) 
    }

    return(
        <div className={chatcss.chatwrapper}>
            <ChatDetails chatData={chatData}/>
            <Textoutput messageLog={messageLog}/>
            <TextInput sendMessage={sendMessage}/>
        </div>
    )
}