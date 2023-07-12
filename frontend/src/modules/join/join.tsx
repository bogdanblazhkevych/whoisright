import React, {useEffect, useState} from "react";
import joincss from "./join.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  code_generated: (a: string) => void;
  all_users_validated: (a: string) => void;
}

interface ClientToServerEvents {
  generate_code: (displayName: string) => void;
  validate_code: (codeInput: string, displayName: string) => void;
}

interface JoinPropsInterface {
    setCurrentDisplay: (a: string) => void;
    sessionId: string;
    setSessionId: (a: string) => void;
    setUserId: (a: string) => void;
    chatData: ChatDataInterface;
    setChatData: (chatData: ChatDataInterface) => void;
}

interface ChatDataInterface {
    sessionId: string,
    userId: string,
    recipiantDisplayName: string,
    senderDisplayName: string
  }

// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://192.168.1.9:8000');
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://192.168.1.6:8000`);

export default function Join(props: JoinPropsInterface){

    const { setCurrentDisplay, sessionId, setSessionId, setUserId, chatData, setChatData } = props

    const [currentJoinDisplay, setCurrentJoinDisplay] = useState('chose')
    const [displayName, setDisplayName] = useState('')
    const [codeInput, setCodeInput] = useState('')
    const [isValidated, setIsValidated] = useState(false)

    function createSession(){
        if (displayName.length === 0) {
            return
        }
        socket.emit("generate_code", displayName)
    }

    function joinSession(){
        if (displayName.length === 0) {
            return
        } 
        setCurrentJoinDisplay('enter-code')
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>):void {
        let codeInputUpperCase = e.target.value.toUpperCase()
        setCodeInput(codeInputUpperCase)
    }

    function handleDisplayNameInput(e: React.ChangeEvent<HTMLInputElement>): void {
        e.preventDefault()
        setDisplayName(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>):void {
        if (e.key === 'Enter') {
            socket.emit("validate_code", codeInput, displayName)
        }
    }

    useEffect(() => {
        console.log("using validerated effect")
        if (isValidated) {
            if (currentJoinDisplay === "enter-code") {
                setSessionId(codeInput)
            }
            setCurrentDisplay("chatroom")
        }
    }, [isValidated])

    useEffect(() => {
        socket.on("code_generated", (code) => {
            setSessionId(code)
            setCurrentJoinDisplay("show-code")
        })

        socket.on("all_users_validated", (userId) => {
            setUserId(userId)
            setIsValidated(true)
        })
    }, [socket])

    return(
        <div className={joincss.joinwrapper}>
            {currentJoinDisplay === "chose" &&
                <>  
                    <input className={joincss.codeinput} onChange={handleDisplayNameInput} value={displayName}></input>
                    <div className={joincss.chosebuttonwrapper}>
                        <div className={joincss.divbutton} onClick={createSession}>
                            Create <br></br> Session
                        </div>
                        <div className={joincss.divbutton} onClick={joinSession}>
                            Join <br></br> Session
                        </div>
                    </div>
                </>
            }
            {currentJoinDisplay === "show-code" && 
                <>
                    <div className={joincss.sessionId}>
                        {sessionId}
                    </div>
                </>
            }
            {currentJoinDisplay === "enter-code" && 
                <>
                    <input className={joincss.codeinput} onChange={handleInputChange} onKeyDown={handleKeyDown} value={codeInput}></input>
                </>
            }
        </div>
    )
}