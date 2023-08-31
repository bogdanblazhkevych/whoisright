import Message from "../message.js";

export default function makeAddMessageUseCase({ database }) {
    return async function addMessageUseCase(messageData) {
        let message = Message.fromClientMessage(messageData);
        await database.addMessageToRoom(message.sessionId, message.serverSchema);
        return {
            messageAdded: true,
            data: message.clientSchema
        }
    }
}