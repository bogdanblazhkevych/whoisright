import React, { useState, useRef } from "react";
import textcss from "./textinput.module.css"
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { text } from "stream/consumers";

interface Textinputprops {
    sendMessage: (message: string) => void;
}

export default function Textinput(props: Textinputprops){
    const {sendMessage} = props;
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const [message, setMessage] = useState('')

    function setDynamicInputHeight(){
        const textArea = textAreaRef.current;

        if (textArea) {
            textArea.rows = 1;
            
            const { paddingTop, paddingBottom } = getComputedStyle(textArea);
            const textAreaPadding = parseInt(paddingTop) + parseInt(paddingBottom);

            const singleRowHeight = textArea.clientHeight - textAreaPadding;
            const currentRowHeight = textArea.scrollHeight - textAreaPadding;

            const rowCount = Math.round(currentRowHeight / singleRowHeight);

            textArea.rows = rowCount;
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>):void {
        setDynamicInputHeight()
        setMessage(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>):void {
        if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage(message)
            setMessage('')
        }
    }

    function handleClick() {
        sendMessage(message);
        setMessage('');
    }

    return(
        <div className={textcss.textinputwrapper}>
            <div className={textcss.typefield}>
                <textarea rows={1} ref={textAreaRef} data-expandable className={textcss.inputelement} value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}></textarea>
                <div className={textcss.sendbutton}>
                    <div className={textcss.arrowicon} onClick={handleClick}>
                        <BsFillArrowUpRightCircleFill />
                    </div>
                </div>
            </div>
        </div>
    )
}