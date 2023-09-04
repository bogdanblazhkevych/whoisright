import User from '../entities/user.js'

export default function makeAddUserUseCase({ database }) {
    return async function addUserUseCase(userId, displayName, userType, sessionId) {
        let user = new User(userId, displayName);
        try {
            const roomInfo = await database.getRoomInfo(sessionId);
            if (!doesRoomExist(roomInfo)) {
                throw new Error("room not found")
            }
            if (isRoomFull(roomInfo)) {
                throw new Error("room is full")
            }
            return addUser(sessionId, userType, user)
        } catch (err) {
            throw err
        }
    }

    function isRoomFull(roomInfo) {
        return roomInfo.users.guest.userId !== null ? true : false
    }

    function doesRoomExist(roomInfo) {
        return Object.keys(roomInfo).length !== 0 ? true : false
    }

    async function addUser(sessionId, userType, user) {
        try {
            let addedUser = await database.addUserToRoom(sessionId, userType, user);
            return {
                userAdded: true,
                data: { sessionId: addedUser.sessionId, ...addedUser.users }
            }
        } catch (err) {
            throw err
        }
    }
}