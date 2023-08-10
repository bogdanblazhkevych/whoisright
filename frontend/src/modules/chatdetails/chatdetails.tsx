import React, { useEffect } from "react";
import chatdetailscss from './chatdetails.module.css'

interface ChatDetailsPropsInterface {
    chatData: {
        sessionId: string,
        // role: string,
        host: {
          displayName: string,
          userId: string
        }
        guest: {
          displayName: string,
          userId: string
        }
    }
}

export default function ChatDetails(props: ChatDetailsPropsInterface){
    const { chatData } = props
    useEffect(() => {
        console.log(chatData)
    })
    return(
        <div className={chatdetailscss.chatdetailswrapper}>
            <div className={chatdetailscss.iconswrapper}>
                <div className={chatdetailscss.usericon}>
                    {chatData.host.displayName[0].toUpperCase()}
                </div>
                <div className={`${chatdetailscss.usericon} ${chatdetailscss.usericonmediator}`}>
                    M
                </div>
                <div className={chatdetailscss.usericon}>
                    {chatData.guest.displayName[0].toUpperCase()}
                </div>
            </div>
            <div className={chatdetailscss.sessionid}>
                {chatData.sessionId}
            </div>
        </div>
    )
}