import entersessionidcss from './entersessionid.module.css'

interface EnterSessionIdPropsInterface {
    handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    codeInput: string,
    joinError: {error: boolean, errorMessage: string},
}

export default function Entersessionid(props: EnterSessionIdPropsInterface) {
    const { handleCodeInputChange, handleKeyDown, codeInput, joinError } = props

    return(
        <div className={entersessionidcss.entersessionidwrapper}>
            <input className={`${entersessionidcss.codeinput} ${joinError.error ? entersessionidcss.codeinputerror : ''}`} onChange={handleCodeInputChange} onKeyDown={handleKeyDown} value={codeInput}></input>
            <div className={entersessionidcss.errormessagewrapper}>
                {joinError.error && joinError.errorMessage}
            </div>
        </div>
    )
}