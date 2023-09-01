import Message from "../message.js";

export default function makeAddMediatorResponseUseCase({ database, mediator }) {
    return async function addMediatorResponseUseCase(sessionId) {
        let roomInfo = await database.getRoomInfo(sessionId);

        if (!roomInfo) {
            throw new Error("failed to retrieve room info")
        }
        console.log("room info in addMediatorResponseUSeCase: ", roomInfo)
        if (roomInfo.messages.length % 3 != 0) {
            throw new Error("no mediator response required")
        }

        let response = await mediator.getMediatorResponse(roomInfo.messages);

        if (!response) {
            throw new Error("failed to get response from mediator")
        }
    
        let message = Message.fromMediatorResponse(response, roomInfo.sessionId);
        let messageAdded = database.addMessageToRoom(roomInfo.sessionId, message.serverSchema);
        
        if (!messageAdded) {
            throw new Error("failed to add mediator response to database")
        }

        return {
            messageAdded: true,
            data: {
                messageData: message.clientSchema,
                roomData: roomInfo
            }
        }

    }

}