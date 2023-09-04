import Message from "../entities/message.js";

export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        try {
            let removeUserData = await database.removeUserFromRoom(userType, sessionId);
            if (isRoomEmpty(removeUserData)) {
                await removeRoom(sessionId);
                throw new Error("removed room from database")
            } else {
                let removedUserDisplayName = removeUserData.users[userType].displayName;
                let removedUserMessage = `user ${removedUserDisplayName} has disconected from the chatroom`
                let message = new Message(removedUserMessage, sessionId, 'system', 'system', 'system', 'system')
                return message.clientSchema
            }
        } catch (err) {
            throw err
        }
    }

    function isRoomEmpty(roomData) {
        return !roomData.users.guest || !roomData.users.host
    }

    async function removeRoom(sessionId) {
        try {
            await database.removeRoomFromDatabase(sessionId);
        } catch (err) {
            throw new Error(`error removing room from database, : ${err.message}`)
        }
    }
}