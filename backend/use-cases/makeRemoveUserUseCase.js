export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        try {
            let removeUserData = await database.removeUserFromRoom(userType, sessionId);
            if (isRoomEmpty(removeUserData)) {
                await removeRoom(sessionId);
                throw new Error("removed room from database")
            } else {
                return removeUserData.users[userType].displayName
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