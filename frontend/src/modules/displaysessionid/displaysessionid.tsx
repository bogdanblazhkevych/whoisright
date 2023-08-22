import displaysessionidcss from './displaysessionid.module.css'

interface DisplaySessionIdPropsInterface {
    sessionId: string
}

export default function Displaysessionid (props: DisplaySessionIdPropsInterface) {

    const { sessionId } = props

    return (
        <div className={displaysessionidcss.displaysessionidwrapper}>
            {sessionId}
        </div>
    )
}