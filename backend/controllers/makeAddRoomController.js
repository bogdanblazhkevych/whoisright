export default function makeAddRoomController({ addRoomUseCase, addUserUseCase }) {
    return async function addRoomController(sessionId, userId, displayName) {
        await addRoomUseCase(sessionId)
        await addUserUseCase(userId, displayName)
    }
} 