import React from "react";
import textoutputcss from './textoutput.module.css'

interface ChatMessageInterface {
    // sender: string;
    message: string
}

interface TextoutputInterface {
    messageLog: ChatMessageInterface[]
}

export default function Textoutput(props: TextoutputInterface){
    const { messageLog } = props;

    return(
        <div className={textoutputcss.textoutputwrapper}>
            {messageLog.map((chatMessage: ChatMessageInterface) => {
                return <div>{chatMessage.message}</div>
            })}
        </div>
    )
}