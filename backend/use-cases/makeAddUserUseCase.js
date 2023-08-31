import User from './../user.js'

export default function makeAddUserUseCase({ database }) {
    return async function addUserUseCase(userId, displayName, userType, sessionId) {
        let user = new User(userId, displayName);
        const roomInfo = await database.getRoomInfo(sessionId);
        if (!doesRoomExist(roomInfo)) {
            return {
                userAdded: false,
                data: "room not found"
            }
        }
        if (isRoomFull(roomInfo)) {
            return {
                userAdded: false,
                data: "room is full"
            }
        }
        return addUser(sessionId, userType, user)
    }

    function isRoomFull(roomInfo) {
        return roomInfo.users.guest.userId !== null ? true : false
    }

    function doesRoomExist(roomInfo) {
        return Object.keys(roomInfo).length !== 0 ? true : false
    }

    async function addUser(sessionId, userType, user) {
        let addedUser = await database.addUserToRoom(sessionId, userType, user);
        return {
            userAdded: true,
            data: { sessionId: addedUser.sessionId, ...addedUser.users }
        }
    }
}