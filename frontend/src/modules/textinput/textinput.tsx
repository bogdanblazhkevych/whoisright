import React from "react";
import textcss from "./textinput.module.css"

export default function Textinput(){

    return(
        <div className={textcss.textinputwrapper}>
            <div className={textcss.typefield}>
                <input className={textcss.inputelement}></input>
            </div>
            <div className={textcss.sendbutton}>

            </div>
        </div>
    )
}