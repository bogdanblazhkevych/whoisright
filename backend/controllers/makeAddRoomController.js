export default function makeAddRoomController({ addRoomUseCase, addUserUseCase }) {
    return async function addRoomController(sessionId, userId, displayName, userType) {
        await addRoomUseCase(sessionId)
        await addUserUseCase(userId, displayName, userType, sessionId)
    }
}