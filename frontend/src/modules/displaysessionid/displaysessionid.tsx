import displaysessionidcss from './displaysessionid.module.css'

interface DisplaySessionIdPropsInterface {
    sessionId: string
}

export default function Displaysessionid (props: DisplaySessionIdPropsInterface) {

    const { sessionId } = props

    return (
        <div className={displaysessionidcss.displaysessionidwrapper}>
            <div className={displaysessionidcss.heading}>
            Send this code to the opposing party
            </div>
            <div className={displaysessionidcss.sessionid}>
                {sessionId}
            </div>
            <div className={displaysessionidcss.body}>
                <div>
                    Waiting for opponent
                </div>
                <div className={displaysessionidcss.customloader}></div>
                </div>
        </div>
    )
}