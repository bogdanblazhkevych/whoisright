import entersessionidcss from './entersessionid.module.css'

interface EnterSessionIdPropsInterface {
    handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    codeInput: string
}

export default function Entersessionid(props: EnterSessionIdPropsInterface) {
    const { handleCodeInputChange, handleKeyDown, codeInput } = props

    return(
        <div className={entersessionidcss.entersessionidwrapper}>
            <input className={entersessionidcss.codeinput} onChange={handleCodeInputChange} onKeyDown={handleKeyDown} value={codeInput}></input>
        </div>
    )
}