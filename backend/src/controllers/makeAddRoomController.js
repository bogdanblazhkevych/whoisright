export default function makeAddRoomController({ addRoomUseCase, addUserUseCase }) {
    return async function addRoomController(sessionId, userId, displayName, userType) {
        try {
            await addRoomUseCase(sessionId)
            await addUserUseCase(userId, displayName, userType, sessionId)
            return {
                target: userId,
                callBack: 'code_generated',
                data: sessionId
            }
        } catch (err) {
            return {
                target: userId,
                callBack: 'error',
                data: err.message ?? 'error in creating room'
            }
        }
    }
}