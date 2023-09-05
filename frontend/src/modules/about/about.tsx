import aboutcss from './aboutcss.module.css'

export default function About() {
    return (
        <div className={aboutcss.aboutwrapper}>
            <div className={aboutcss.heading}>
                ARBITRATOR.AI
            </div>
            <div className={aboutcss.body}>
                Ai driven conflict resolution
            </div>
            <div className={aboutcss.body}>
                Welcome! This website uses OpanAi's GPT 3.5 Turbo to add an arbitrator to your texts.
            </div>
            <div className={aboutcss.body}>
                Select <span style={{ color: "#E1E1E3", fontWeight: 800 }}>Create Session</span> to create a chat room. Relay the generated session code to the opposing party.
            </div>
            <div className={aboutcss.body}>
                Select <span style={{ color: "#E1E1E3", fontWeight: 800 }}>Join Session</span> if you have received a session code to be connected with the opposing party.
            </div>
        </div>
    )
}