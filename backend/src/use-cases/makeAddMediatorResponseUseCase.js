import Message from "../entities/message.js";

export default function makeAddMediatorResponseUseCase({ database, mediator }) {
    return async function addMediatorResponseUseCase(sessionId) {
        try {
            let roomInfo = await database.getRoomInfo(sessionId);
            if (roomInfo.messages.length % 3 != 0) {
                throw new Error("no mediator response required")
            }
            let response = await mediator.getMediatorResponse(roomInfo.messages);
            let message = Message.fromMediatorResponse(response, roomInfo.sessionId);
            await database.addMessageToRoom(roomInfo.sessionId, message.serverSchema);
            return message.clientSchema
        } catch (err) {
            throw err
        }
    }

}