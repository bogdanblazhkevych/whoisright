import React, {useEffect, useState} from "react";
import joincss from "./join.module.css"
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  code_generated: (a: string) => void;
  all_users_validated: (chatData: ChatDataInterface) => void;
}

interface ClientToServerEvents {
  generate_code: (displayName: string) => void;
  validate_code: (codeInput: string, displayName: string) => void;
}

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

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://10.94.73.170:8000`);

export default function Join(props: JoinPropsInterface){

    const { setCurrentDisplay, setChatData, chatData, setUserType } = props

    const [currentJoinDisplay, setCurrentJoinDisplay] = useState('chose')
    const [displayName, setDisplayName] = useState('')
    const [codeInput, setCodeInput] = useState('')

    function createSession(){
        if (displayName.length === 0) {
            return
        }
        setUserType('host')
        socket.emit("generate_code", displayName)
    }

    function joinSession(){
        if (displayName.length === 0) {
            return
        } 
        setUserType('guest')
        setCurrentJoinDisplay('enter-code')
    }

    function handleCodeInputChange(e: React.ChangeEvent<HTMLInputElement>):void {
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
        socket.on("code_generated", (code) => {
            setChatData({...chatData, sessionId: code})
            setCurrentJoinDisplay("show-code")
            console.log("code generated: ", code)
        })

        socket.on("all_users_validated", (chatData) => {
            console.log(chatData)
            setChatData(chatData)
            setCurrentDisplay('chatroom')
        })
    }, [socket])

    return(
        <div className={joincss.joinwrapper}>
            {currentJoinDisplay === "chose" &&
                <div className={joincss.chosewrapper}>  
                    <div className={joincss.textwrapper}>
                        <div className={joincss.heading}>
                            ARBITRATOR.AI
                        </div>
                        <div className={joincss.body}>
                        Ai driven conflict resolution
                        </div>
                        <div className={joincss.body}>
                        Get started by entering your name in the input field.
                        </div>
                        <div className={joincss.body}>
                        Select <span style={{color: "#E1E1E3", fontWeight: 800}}>Create Session</span> to create a chat room. Relay the generated session code to the opposing party.
                        </div>
                        <div className={joincss.body}>
                        Select <span style={{color: "#E1E1E3", fontWeight: 800}}>Join Session</span> if you have received a session code to be connected with the opposing party.
                        </div>
                    </div>

                    <div className={joincss.inputwrapper}>
                        <input className={joincss.codeinput} onChange={handleDisplayNameInput} value={displayName} placeholder="Display Name"></input>
                        <div className={joincss.divbutton} onClick={createSession}>
                            Create Session
                        </div>
                        <div className={joincss.divbutton} onClick={joinSession}>
                            Join Session
                        </div>
                    </div>
                </div>
            }
            {currentJoinDisplay === "show-code" && 
                <>
                    <div className={joincss.sessionId}>
                        {chatData.sessionId}
                    </div>
                </>
            }
            {currentJoinDisplay === "enter-code" && 
                <>
                    <input className={joincss.codeinput} onChange={handleCodeInputChange} onKeyDown={handleKeyDown} value={codeInput}></input>
                </>
            }
        </div>
    )
}