import React, { useEffect, useState } from "react";
import chatdetailscss from './chatdetails.module.css'
import { HiOutlineInformationCircle, HiOutlineXCircle } from "react-icons/hi";

interface ChatDetailsPropsInterface {
    chatData: {
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
}

export default function ChatDetails(props: ChatDetailsPropsInterface){
    const { chatData } = props;
    const [infoHidden, setInfoHidden] = useState(false)
    
    const handleClick = () => {
        const currentDisplaySetting = document.documentElement.style.getPropertyValue('--information-display');
        if (currentDisplaySetting == "flex") {
            document.documentElement.style.setProperty('--information-display', 'none');
            setInfoHidden(true)
        } else {
            document.documentElement.style.setProperty('--information-display', 'flex');
            setInfoHidden(false)
        }
    }
    return(
        <div className={chatdetailscss.chatdetailswrapper}>
            <div className={chatdetailscss.chatdetailscontainer}>
                <div className={chatdetailscss.informationtoggle} onClick={handleClick}>
                    {infoHidden ? <HiOutlineInformationCircle /> : <HiOutlineXCircle />}
                </div>
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
        </div>
    )
}