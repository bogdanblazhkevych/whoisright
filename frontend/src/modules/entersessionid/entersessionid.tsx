import entersessionidcss from './entersessionid.module.css'

interface EnterSessionIdPropsInterface {
    handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    createSession: () => void;
    codeInput: string;
    joinError: {error: boolean, errorMessage: string};
}

export default function Entersessionid(props: EnterSessionIdPropsInterface) {
    const { handleCodeInputChange, handleKeyDown, createSession, codeInput, joinError } = props

    return(
        <div className={entersessionidcss.entersessionidwrapper}>
            <div className={entersessionidcss.heading}>
                Enter the code from the opposing party
            </div>
            <input className={`${entersessionidcss.codeinput} ${joinError.error ? entersessionidcss.codeinputerror : ''}`} onChange={handleCodeInputChange} onKeyDown={handleKeyDown} value={codeInput} placeholder="Enter Code"></input>
            <div className={entersessionidcss.errormessagewrapper}>
                {joinError.error && joinError.errorMessage}
            </div>
            <div className={entersessionidcss.heading}>
                Didn't receive a code? <span className={entersessionidcss.headingbold} onClick={createSession}>Create Session</span>
            </div>
        </div>
    )
}