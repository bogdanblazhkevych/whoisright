export default function makeRemoveUserUseCase({ database }) {
    return async function removeUserUseCase(sessionId, userType) {
        let removeUserData = await database.removeUserFromRoom(userType, sessionId);
        console.log("removeUserData: ", removeUserData)
        if (isRoomEmpty(removeUserData)) {
            await removeRoom(sessionId);
            return
        }
        const remainingUserType = userType == "host" ? "guest" : "host"
        try {
            let removeUserData = await database.removeUserFromRoom(userType, sessionId);
            return {
                removedUserName: removeUserData.users[userType].displayName,
                remainingUserId: removeUserData.users[remainingUserType].userId
            }
        } catch (err) {
            console.log("error in calling db function removeUserFromRoom in makeRemoveUserUseCase: ", err)
            return
        }
    }

    function isRoomEmpty(roomData) {
        return !roomData.users.guest && !roomData.users.guest
    }

    async function removeRoom(sessionId) {
        try {
            await database.removeRoomFromDatabase(sessionId);
        } catch (err) {
            console.log("error calling removeRoomFromDatabase in removeUserUseCase", err)
        }
    }
}

//user has been removed
///////////////////////
//remaining user id
//removed users name

//user has not been removed
///////////////////////////

//room has been removed 
///////////////////////

//room has not been removed
///////////////////////////