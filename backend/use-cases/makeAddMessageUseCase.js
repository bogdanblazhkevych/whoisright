import Message from "../message.js";

export default function makeAddMessageUseCase({ database }) {
    return async function addMessageUseCase(messageData) {
        let message = Message.fromClientMessage(messageData);
        try {
            await database.addMessageToRoom(message.sessionId, message.serverSchema);
            return message.clientSchema
        } catch (err) {
            throw err
        }
    }
}