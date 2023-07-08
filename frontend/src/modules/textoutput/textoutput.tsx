import React from "react";
import textoutputcss from './textoutput.module.css'

interface ChatMessageInterface {
    // sender: string;
    message: string,
    sessionId: string,
    type: string,
    userId: string
}

interface TextoutputInterface {
    messageLog: ChatMessageInterface[]
}

export default function Textoutput(props: TextoutputInterface){
    const { messageLog } = props;

    return(
        <div className={textoutputcss.textoutputwrapper}>
            {messageLog.map((chatMessage: ChatMessageInterface, index: number) => {
                return (
                    <>
                        <div key={index} className={`${textoutputcss.message} ${textoutputcss[chatMessage.type]}`}>{chatMessage.message}</div>
                        <div key={`${index}sender`} className={`${textoutputcss.sender} ${textoutputcss[`sender${chatMessage.type}`]}`}>{chatMessage.userId}</div>
                    </>
                )
            })}
        </div>
    )
}