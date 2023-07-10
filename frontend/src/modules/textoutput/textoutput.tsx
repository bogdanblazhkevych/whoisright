import React, { useEffect, useRef } from "react";
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
    const textOutputWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textOutputWrapperRef.current) {
            textOutputWrapperRef.current.scrollTop = textOutputWrapperRef.current.scrollHeight
        }
    }, [messageLog])

    return(
        <div className={textoutputcss.textoutputwrapper} ref={textOutputWrapperRef}>
            {messageLog.map((chatMessage: ChatMessageInterface, index: number) => {
                console.log(chatMessage.userId != messageLog[index + 1]?.userId)
                return (
                    <>
                        <div key={index} className={`${textoutputcss.message} ${textoutputcss[chatMessage.type]}`}>{chatMessage.message}</div>
                        {/* <div key={`${index}sender`} className={`${textoutputcss.sender} ${textoutputcss[`sender${chatMessage.type}`]}`}>{chatMessage.userId}</div> */}
                        {chatMessage.userId != messageLog[index + 1]?.userId && <div key={`${index}sender`} className={`${textoutputcss.sender} ${textoutputcss[`sender${chatMessage.type}`]}`}>{chatMessage.userId}</div>}
                    </>
                )
            })}
        </div>
    )
}