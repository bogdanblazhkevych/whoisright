import React, { useState, useRef } from "react";
import textcss from "./textinput.module.css"
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';

interface Textinputprops {
    sendMessage: (message: string) => void;
}

export default function Textinput(props: Textinputprops){
    const {sendMessage} = props;
    const textarearef = useRef<HTMLTextAreaElement>(null)

    const [message, setMessage] = useState('')

    function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>):void {
        setMessage(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>):void {
        if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage(message)
            setMessage('')
            revertInputHeight()
        } else {
            setInputHeight()
        }
    }

    function handleClick() {
        sendMessage(message);
        setMessage('');
        revertInputHeight()  
    }

    function setInputHeight() {
        if (textarearef.current) {
            console.log(textarearef.current.style.height)
            if (textarearef.current.scrollHeight > textarearef.current.clientHeight) {
                textarearef.current.rows += 1
            }
        }
    }

    function revertInputHeight() {
        if (textarearef.current) {
            textarearef.current.rows = 1;
        }
    }

    return(
        <div className={textcss.textinputwrapper}>
            <div className={textcss.typefield}>
                <textarea rows={1} ref={textarearef} data-expandable className={textcss.inputelement} value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}></textarea>
            </div>
            <div className={textcss.sendbutton}>
                <div className={textcss.arrowicon} onClick={handleClick}>
                    <BsFillArrowUpRightCircleFill />
                </div>
            </div>
        </div>
    )
}