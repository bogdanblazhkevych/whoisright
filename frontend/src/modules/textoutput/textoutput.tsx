import React, { useEffect, useRef } from "react";
import textoutputcss from './textoutput.module.css'

interface ChatMessageInterface {
    message: string,
    sessionId: string,
    type: string,
    userId: string,
    displayName: string
}

interface TextoutputInterface {
    messageLog: ChatMessageInterface[]
}

export default function Textoutput(props: TextoutputInterface) {
    const { messageLog } = props;
    const textOutputWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textOutputWrapperRef.current) {
            textOutputWrapperRef.current.scrollTop = textOutputWrapperRef.current.scrollHeight
        }
    }, [messageLog])

    return (
        // <div className={textoutputcss.testwrapper}>

            <div className={textoutputcss.textoutputwrapper} ref={textOutputWrapperRef}>
                {messageLog.map((chatMessage: ChatMessageInterface, index: number) => {
                    return (
                        <>
                            <div key={index} className={`${textoutputcss.message} ${textoutputcss[chatMessage.type]}`}>{chatMessage.message}</div>
                            {
                                chatMessage.userId != messageLog[index + 1]?.userId && 
                                chatMessage.type != 'system' &&
                                <div key={`${index}sender`} className={`${textoutputcss.sender} ${textoutputcss[`sender${chatMessage.type}`]}`}>{chatMessage.displayName}</div>
                            }
                        </>
                    )
                })}
            </div>
        // </div>
    )
}