import homecss from './home.module.css'

interface HomePropsInterface {
    handleDisplayNameInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    createSession: () => void,
    joinSession: () => void,
    displayName: string,
}

export default function Home(props: HomePropsInterface) {

    const { handleDisplayNameInputChange, createSession, joinSession, displayName } = props

    return (
        <div className={homecss.homewrapper}>
            <div className={homecss.chosewrapper}>
                <div className={homecss.textwrapper}>
                    <div className={homecss.heading}>
                        ARBITRATOR.AI
                    </div>
                    <div className={homecss.body}>
                        Ai driven conflict resolution
                    </div>
                    <div className={homecss.body}>
                        Get started by entering your name in the input field.
                    </div>
                    <div className={homecss.body}>
                        Select <span className={homecss.bodyspan}>Create Session</span> to create a chat room. Relay the generated session code to the opposing party.
                    </div>
                    <div className={homecss.body}>
                        Select <span className={homecss.bodyspan}>Join Session</span> if you have received a session code to be connected with the opposing party.
                    </div>
                </div>

                <div className={homecss.inputwrapper}>
                    <input className={homecss.codeinput} onChange={handleDisplayNameInputChange} value={displayName} placeholder="Display Name"></input>
                    <div className={homecss.divbutton} onClick={createSession}>
                        Create Session
                    </div>
                    <div className={homecss.divbutton} onClick={joinSession}>
                        Join Session
                    </div>
                </div>
            </div>
        </div>
    )
}