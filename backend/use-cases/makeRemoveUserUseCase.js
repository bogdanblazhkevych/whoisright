export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        let removeUserData = await database.removeUserFromRoom(userType, sessionId);
        if (isRoomEmpty(removeUserData)) {
            await removeRoom(sessionId);
            return
        } else {
            const remainingUserType = userType == "host" ? "guest" : "host"
            return {
                removedUserName: removeUserData.users[userType].displayName,
                remainingUserId: removeUserData.users[remainingUserType].userId
            }
        }
    }

    function isRoomEmpty(roomData) {
        return !roomData.users.guest || !roomData.users.host
    }

    async function removeRoom(sessionId) {
        try {
            await database.removeRoomFromDatabase(sessionId);
        } catch (err) {
            console.log("error calling removeRoomFromDatabase in removeUserUseCase", err)
        }
    }
}