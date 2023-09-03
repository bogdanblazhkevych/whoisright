export default function makeRemoveUserController({ removeUserUseCase }) {
    return async function removeUserController(sessionId, userType) {
        try {
            let removeUserData = await removeUserUseCase(sessionId, userType);
            return {
                target: sessionId,
                callBack: 'user-removed',
                data: removeUserData
            }
        } catch (err) {
            return {
                target: sessionId,
                callBack: 'error',
                data: err.message
            }
        }
    }
}