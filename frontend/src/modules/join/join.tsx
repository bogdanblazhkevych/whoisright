import React, { useEffect, useState } from "react";
import joincss from "./join.module.css"
import socket from './../../socket'
import Home from "../home/home";
import Displaysessionid from "../displaysessionid/displaysessionid";
import Entersessionid from "../entersessionid/entersessionid";

interface JoinPropsInterface {
    setCurrentDisplay: (currentDisplay: string) => void;
    chatData: ChatDataInterface;
    setChatData: (chatData: ChatDataInterface) => void;
    setUserType: (userType: "guest" | "host") => void;
}

interface ChatDataInterface {
    sessionId: string,
    host: {
        displayName: string,
        userId: string
    }
    guest: {
        displayName: string,
        userId: string
    }
}

export default function Join(props: JoinPropsInterface) {

    const { setCurrentDisplay, setChatData, chatData, setUserType } = props

    const [currentJoinDisplay, setCurrentJoinDisplay] = useState('home')
    const [displayName, setDisplayName] = useState('')
    const [codeInput, setCodeInput] = useState('')
    const [sessionIdInvalid, setSessionIdInvalid] = useState(false)

    function createSession() {
        if (displayName.length === 0) {
            return
        }
        setUserType('host')
        socket.emit("generate_code", displayName)
    }

    function joinSession() {
        if (displayName.length === 0) {
            return
        }
        setUserType('guest')
        setCurrentJoinDisplay('enter-code')
    }

    function handleCodeInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        let codeInputUpperCase = e.target.value.toUpperCase()
        setCodeInput(codeInputUpperCase)
    }

    function handleDisplayNameInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        e.preventDefault()
        setDisplayName(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === 'Enter') {
            socket.emit("validate_code", codeInput, displayName)
        }
    }

    useEffect(() => {
        socket.on("code_generated", (code) => {
            setChatData({ ...chatData, sessionId: code })
            setCurrentJoinDisplay("show-code")
            console.log("code generated: ", code)
        })

        socket.on("all_users_validated", (chatData) => {
            console.log(chatData)
            setChatData(chatData)
            setCurrentDisplay('chatroom')
        })

        socket.on("invalid_session_id", () => {
            setSessionIdInvalid(true)

            setTimeout(() => {
                setSessionIdInvalid(false)
            }, 1000)
        })
    }, [socket])

    return (
        <div className={joincss.joinwrapper}>
            {currentJoinDisplay === "home" &&
                <Home handleDisplayNameInputChange={handleDisplayNameInputChange}
                      createSession={createSession} 
                      joinSession={joinSession} 
                      displayName={displayName} />
            }
            {currentJoinDisplay === "show-code" &&
                <Displaysessionid sessionId={chatData.sessionId}/>
            }
            {currentJoinDisplay === "enter-code" &&
                <Entersessionid handleCodeInputChange={handleCodeInputChange} 
                                handleKeyDown={handleKeyDown} 
                                codeInput={codeInput} 
                                sessionIdInvalid={sessionIdInvalid}/>
            }
        </div>
    )
}