import React, { useState } from "react";
import textcss from "./textinput.module.css"

export default function Textinput(){

    const [message, setMessage] = useState('')

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setMessage(e.target.value)
    }

    return(
        <div className={textcss.textinputwrapper}>
            <div className={textcss.typefield}>
                <input className={textcss.inputelement} value={message} onChange={handleInputChange}></input>
            </div>
            <div className={textcss.sendbutton}>
                <button>send</button>
            </div>
        </div>
    )
}