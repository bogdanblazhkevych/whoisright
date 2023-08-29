export default class Message {
    constructor(message, sessionId, type, userId, displayName, role) {
        this.message = message,
        this.sessionId = sessionId,
        this.type = type, 
        this.userId = userId,
        this.displayName = displayName,
        this.role = role
    }

    get serverSchema() {
        return {
            role: this.role,
            name: this.displayName,
            content: this.message
        }
    }

    get clientSchema() {
        return {
            message: this.message,
            sessionId: this.sessionId,
            type: this.type,
            userId: this.userId,
            displayName: this.displayName
        }
    }

    static fromClientMessage(messageData) {
        return new Message(messageData.message, messageData.sessionId, 'incomming', messageData.userId, messageData.displayName, 'user')
    }

    static fromMediatorResponse(mediatorResponse, sessionId) {
        return new Message(mediatorResponse, sessionId, 'mediator', 'Mediator', 'Mediator')
    }
}