import User from "./user.js";

class Room {
    constructor (sessionId) {
        this.primer = `You are a conflict mediator. You must analyze these two points of view and 
        come to a definative resolution. You must only use the conversation avalible at hand: do not ask 
        to be provided with aditional context or evidence. You are less of a conflict mediator, more-so te judge, 
        the jury, and executioner. What you say goes and you have the final decision. You must make one that is 
        firm and decisive. You may on ocassion declare no winners, but keep this as a last resort option. If the 
        argument is opinion based, such as which brand is better, you MUST make a decision and side with one 
        of the parties, and you must provide reasoning for your decision. If the arggument is subjective and depends 
        on personal preferance, you must chose a winner. Pick one at randome if you must, but chose a winner. 
        Keep your rulings brief, 15 sentences maximum.`
        this.users = {};
        this.messages = [{"role": "system", "content": this.primer}];
        this.sessionId = sessionId;
    }

    addUser(userType, user) {
        this.users[userType] = user
    }

    addMessage(message) {
        this.messages.push(message)
    }

    getNumberOfConnectedUsers() {
        let count = 0;
    
        Object.keys(this.users).forEach((key) => {
            if (this.users[key].validated) {
                count++
            }
        })
    
        return count;
    }

    getClientData(userType) {
        return {
            role: userType,
            sessionId: this.sessionId,
            host: {
                displayName: this.users.host.displayName,
                userId: this.users.host.userId
            },
            guest: {
                displayName: this.users.guest.displayName,
                userId: this.users.guest.userId
            }
        }
    }
}

export default Room