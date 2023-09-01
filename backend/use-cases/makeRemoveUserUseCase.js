export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        let removeUserData = await database.removeUserFromRoom(userType, sessionId);

        if (isRoomEmpty(removeUserData)) {
            //remove room from db
            await removeRoom(sessionId);
        }

        //removed user

        //removed room

        //did nothing
    }

    function isRoomEmpty(roomData) {
        return !roomData.users.guest && !roomData.users.guest
    }

    async function removeRoom(sessionId) {
        await database.removeRoomFromDatabase(sessionId)
    }
}