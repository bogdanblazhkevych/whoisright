import React, { useState, useEffect, useRef } from "react";
import TextInput from "../textinput/textinput";
import Textoutput from "../textoutput/textoutput";
import chatcss from "./chat.module.css"
import { io, Socket } from "socket.io-client";
import ChatDetails from "../chatdetails/chatdetails";
import socket from './../../socket'

// interface ServerToClientEvents {
//   receive_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void;
// }

// interface ClientToServerEvents {
//   send_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void;
//   join_room: (sessionId: string) => void;
// }

interface ChatMessageInterface {
    message: string,
    sessionId: string,
    type: string,
    userId: string,
    displayName: string
}

interface ChatPropsInterface {
    chatData: {
        sessionId: string,
        host: {
          displayName: string,
          userId: string
        }
        guest: {
          displayName: string,
          userId: string
        }
    },
    userType: "guest" | "host";
}

// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://192.168.1.5:8000`);

export default function Chat(props: ChatPropsInterface){
    const { chatData, userType } = props;
    const sessionId = chatData.sessionId;
    const userId = chatData[userType].userId
    const displayName = chatData[userType].displayName
    const type = "outgoing"
    const [messageLog, setMessageLog] = useState<ChatMessageInterface[]>([]);

    useEffect(() => {
        console.log(sessionId)
        socket.emit('join_room', sessionId)

        socket.on('receive_message', (message) => {
            console.log(message)
            setMessageLog((previous) => [...previous, message])            
        })
    }, [socket])

    function sendMessage(message: string) {
        socket.emit("send_message", {message, sessionId, type, userId, displayName})
        setMessageLog((previous) => [...previous, {message, sessionId, type, userId, displayName}]) 
    }

    function didUserSendLastMessage() {
        if (messageLog.length > 0) {
            return messageLog[messageLog.length - 1].userId == userId
        } else {
            return false
        }
    }

    console.log(userId)

    return(
        <div className={chatcss.chatwrapper}>
            <ChatDetails chatData={chatData}/>
            <Textoutput messageLog={messageLog}/>
            <TextInput sendMessage={sendMessage} didUserSendLastMessage={didUserSendLastMessage}/>
        </div>
    )
}
