import User from "./user.js";

class Room {
    constructor (sessionId) {
        this.users = {};
        this.messages = [{userId:'system', message: "Hello I am your arbitrator.", displayName:'mediator'}];
        this.sessionId = sessionId
    }

    
    addUser(userType, user) {
        this.users[userType] = user
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