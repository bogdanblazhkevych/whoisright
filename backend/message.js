export default class Message {
    constructor(message, sessionId, type, userId, displayName, role) {
        this.message = message,
        this.sessionId = sessionId,
        this.type = type, 
        this.userId = userId,
        this.displayName = displayName,
        this.role = role
    }

    serverSchema() {
        return {
            role: this.role,
            name: this.displayName,
            content: this.message
        }
    }

    clientSchema() {
        return {
            message: this.message,
            sessionId: this.sessionId,
            type: this.type,
            userId: this.userId,
            displayName: this.displayName
        }
    }
}