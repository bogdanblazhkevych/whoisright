export default function makeRemoveUserController({ removeUserUseCase }) {
    return async function removeUserController(sessionId, userType) {
        let removeUserData = await removeUserUseCase(sessionId, userType);
        return {
            target: removeUserData?.remainingUserId ?? '',
            callback: 'user-removed',
            data: removeUserData?.removedUserName ?? ''
        }
    }
}