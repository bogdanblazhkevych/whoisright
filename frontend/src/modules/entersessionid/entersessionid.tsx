import { useEffect } from 'react'
import entersessionidcss from './entersessionid.module.css'

interface EnterSessionIdPropsInterface {
    handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    codeInput: string,
    sessionIdInvalid: boolean
}

export default function Entersessionid(props: EnterSessionIdPropsInterface) {
    const { handleCodeInputChange, handleKeyDown, codeInput, sessionIdInvalid } = props

    // useEffect(()=>{
    //     if (sessionIdInvalid) {

    //     }
    // }, [sessionIdInvalid])

    return(
        <div className={entersessionidcss.entersessionidwrapper}>
            <input className={`${entersessionidcss.codeinput} ${sessionIdInvalid ? entersessionidcss.codeinputerror : ''}`} onChange={handleCodeInputChange} onKeyDown={handleKeyDown} value={codeInput}></input>
        </div>
    )
}