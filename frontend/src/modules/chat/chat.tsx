import React from "react";
import Textinput from "../textinput/textinput";
import chatcss from "./chat.module.css"

export default function Chat(){
    return(
        <div className={chatcss.chatwrapper}>
            <Textinput />
        </div>
    )
}