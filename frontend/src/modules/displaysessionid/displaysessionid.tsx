import displaysessionidcss from './displaysessionid.module.css'

interface DisplaySessionIdInterface {
    sessionId: string
}

export default function Displaysessionid (props: DisplaySessionIdInterface) {

    const { sessionId } = props

    return (
        <div className={displaysessionidcss.displaysessionidwrapper}>
            {sessionId}
        </div>
    )
}