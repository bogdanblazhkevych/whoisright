import React, { useState } from "react";
import textcss from "./textinput.module.css"

interface Textinputprops {
    sendMessage: (message: string) => void;
}

export default function Textinput(props: Textinputprops){
    const {sendMessage} = props

    const [message, setMessage] = useState('')

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>):void {
        setMessage(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>):void {
        if (e.key === 'Enter') {
            sendMessage(message)
            setMessage('')
        }
    }

    return(
        <div className={textcss.textinputwrapper}>
            <div className={textcss.typefield}>
                <input className={textcss.inputelement} value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}></input>
            </div>
            <div className={textcss.sendbutton}>
                <button>send</button>
            </div>
        </div>
    )
}