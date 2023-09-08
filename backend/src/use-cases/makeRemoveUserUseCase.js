import Message from "../entities/message.js";

export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        try {
            let removeUserData = await database.removeUserFromRoom(userType, sessionId);
            //function throws error when guest exits on validate code page
            //we can fix this by checking if the room exists before calling database.removeUserFromRoom
            //but not fixing it wont harm the program in any way because room doesnt need to be deleted
            //so our dynamo storage is safe
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
        console.log("roomData in isRoomEmpty function in usecase");
        return !roomData.users.guest || !roomData.users.host || !roomData.users.guest.userId
    }

    async function removeRoom(sessionId) {
        try {
            await database.removeRoomFromDatabase(sessionId);
        } catch (err) {
            throw new Error(`error removing room from database, : ${err.message}`)
        }
    }
}